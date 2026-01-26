import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { JupiterError, MethodNotSupportedError } from "../../../exceptions";
import { ChainType, FeePaymentMethod, SwapParams } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawTransaction, TransactionResponse } from "../../models";
import { addUnitLimitAndUnitPriceToVersionedTx } from "../../utils/sol/compute-budget";
import { ChainBridgeService, SendParams, TxSendParamsSol } from "../models";
import { prepareTxSendParams } from "../utils";
import { BridgeTxService } from "./bridge-tx-service";
import { JupiterParams, JupiterService } from "./jupiter-service";
import { PayerWithTokenService } from "./payer-with-token-service";
import { amendJupiterWithSdkTx, SolTxSendParams } from "./utils";

export interface SolanaBridgeParams {
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
  cctpParams: CctpParams;
  jupiterParams: JupiterParams;
}

export interface CctpParams {
  cctpTransmitterProgramId: string;
  cctpTokenMessengerMinter: string;
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
