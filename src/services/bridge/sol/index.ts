import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { JupiterError, MethodNotSupportedError, SdkError } from "../../../exceptions";
import { ChainType, FeePaymentMethod, SwapParams } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawTransaction, TransactionResponse } from "../../models";
import { addUnitLimitAndUnitPriceToVersionedTx } from "../../utils/sol/compute-budget";
import { ChainBridgeService, SendParams, TxSendParamsSol, TxTransferParams } from "../models";
import { prepareTxSendParams } from "../utils";
import { BridgeTxService } from "./bridge-tx-service";
import { JupiterParams, JupiterService } from "./jupiter-service";
import { PayerWithTokenService } from "./payer-with-token-service";
import { amendJupiterWithSdkTx, SolTxSendParams } from "./utils";

export interface SolanaBridgeParams {
  /** @deprecated Do not use. */
  wormholeMessengerProgramId?: string;
  solanaLookUpTable: string;
  cctpParams: CctpParams;
  jupiterParams: JupiterParams;
}

export interface CctpParams {
  cctpTransmitterProgramId: string;
  cctpTokenMessengerMinter: string;
  cctpV2TransmitterProgramId: string;
  cctpV2TokenMessengerMinter: string;
  cctpDomains: CctpDomains;
}

/**
 * Type representing a map of CCTP domains to their corresponding numeric values.
 *
 * @typedef {Record<string, number>} CctpDomains
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {number} value - The numeric value associated with the specified chain.
 */
export type CctpDomains = Record<string, number>;

export class SolanaBridgeService extends ChainBridgeService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;

  private readonly connection: Connection;
  private jupiterService: JupiterService;
  private bridgeTxService: BridgeTxService;
  private payerWithTokenService: PayerWithTokenService;
  constructor(
    public solanaRpcUrl: string,
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.connection = new Connection(solanaRpcUrl);
    this.jupiterService = new JupiterService(api, params.jupiterParams);
    this.bridgeTxService = new BridgeTxService(solanaRpcUrl, params, api);
    this.payerWithTokenService = new PayerWithTokenService(solanaRpcUrl, params, api);
  }

  /** @deprecated Do not use. */
  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    return this.bridgeTxService.buildRawTransactionSwap(params);
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    const solTxSendParams = this.addPoolAddress(params, txSendParams);

    const paymentType = params.gasFeePaymentMethod ?? FeePaymentMethod.WITH_NATIVE_CURRENCY;

    let tx: VersionedTransaction;
    let requiredMessageSigner: Keypair | undefined;

    switch (paymentType) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        const builtTxResult = await this.buildTxWithNativePayment(params, solTxSendParams);
        tx = builtTxResult.tx;
        requiredMessageSigner = builtTxResult.requiredMessageSigner;
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        const builtTxResult = await this.buildTxWithStablePayment(params, solTxSendParams);
        tx = builtTxResult.tx;
        requiredMessageSigner = builtTxResult.requiredMessageSigner;
        break;
      }
      case FeePaymentMethod.WITH_ABR: {
        const builtTxResult = await this.buildTxWithAbrPayment(params, solTxSendParams);
        tx = builtTxResult.tx;
        requiredMessageSigner = builtTxResult.requiredMessageSigner;
        break;
      }
      default: {
        return assertNever(paymentType, "Unhandled FeePaymentMethod");
      }
    }
    await addUnitLimitAndUnitPriceToVersionedTx(tx, params.txFeeParams, this.solanaRpcUrl);

    if (requiredMessageSigner) {
      tx.sign([requiredMessageSigner]);
    }
    return tx;
  }

  private async buildTxWithNativePayment(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner: Keypair | undefined }> {
    return await this.bridgeTxService.buildRawTransactionSend(params, solTxSendParams);
  }

  private async buildTxWithStablePayment(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner: Keypair | undefined }> {
    const { jupTx, solTxSendParams: updatedSolTxSendParams } = await this.jupiterService.buildJupAndUpdateTxSendParams(
      params,
      solTxSendParams
    );

    const { tx, requiredMessageSigner } = await this.bridgeTxService.buildRawTransactionSend(
      params,
      updatedSolTxSendParams
    );

    if (!jupTx) {
      throw new JupiterError("Swap tx is absent");
    }
    const resultTx = await amendJupiterWithSdkTx(this.connection, jupTx, tx);
    return { tx: resultTx, requiredMessageSigner: requiredMessageSigner };
  }

  private async buildTxWithAbrPayment(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ tx: VersionedTransaction; requiredMessageSigner?: Keypair }> {
    return this.payerWithTokenService.buildRawTransactionSend(params, solTxSendParams);
  }

  /**
   * Builds a plain transfer to `params.toAddress`, signed by (and paid by) `params.fromAccountAddress`:
   * - `token.isNative`: a `SystemProgram.transfer` of `amount` lamports;
   * - otherwise: an idempotent creation of the recipient's associated token account followed by
   *   an SPL `transferChecked` of `amount` from the sender's associated token account.
   *   The token program (SPL Token or Token-2022) is taken from the mint account owner.
   *   Token-2022 mints with a transfer hook are not supported (the hook accounts are not resolved).
   *
   * No compute budget instructions are added: the wallet sets the priority fee.
   * Used for `Messenger.NEAR_INTENTS` deposits.
   */
  async buildRawTransactionTransfer(params: TxTransferParams): Promise<RawTransaction> {
    const { amount, token, fromAccountAddress, toAddress } = params;
    const sender = new PublicKey(fromAccountAddress);
    const recipient = new PublicKey(toAddress);

    const instructions: TransactionInstruction[] = [];
    if (token.isNative) {
      instructions.push(SystemProgram.transfer({ fromPubkey: sender, toPubkey: recipient, lamports: BigInt(amount) }));
    } else {
      const mint = new PublicKey(token.tokenAddress);
      const tokenProgramId = await this.getTokenProgramId(mint);
      const senderTokenAccount = getAssociatedTokenAddressSync(mint, sender, true, tokenProgramId);
      const recipientTokenAccount = getAssociatedTokenAddressSync(mint, recipient, true, tokenProgramId);
      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          sender,
          recipientTokenAccount,
          recipient,
          mint,
          tokenProgramId
        ),
        createTransferCheckedInstruction(
          senderTokenAccount,
          mint,
          recipientTokenAccount,
          sender,
          BigInt(amount),
          token.decimals,
          [],
          tokenProgramId
        )
      );
    }

    const { blockhash } = await this.connection.getLatestBlockhash();
    const message = new TransactionMessage({
      payerKey: sender,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();
    return new VersionedTransaction(message);
  }

  private async getTokenProgramId(mint: PublicKey): Promise<PublicKey> {
    const mintAccount = await this.connection.getAccountInfo(mint);
    if (!mintAccount) {
      throw new SdkError(`Solana mint ${mint.toBase58()} not found`);
    }
    if (mintAccount.owner.equals(TOKEN_PROGRAM_ID) || mintAccount.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      return mintAccount.owner;
    }
    throw new SdkError(`Solana mint ${mint.toBase58()} is not owned by a token program`);
  }

  send(_params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  private addPoolAddress(params: SendParams, txSendParams: TxSendParamsSol): SolTxSendParams {
    return {
      ...txSendParams,
      poolAddress: params.sourceToken.poolAddress,
    };
  }
}
