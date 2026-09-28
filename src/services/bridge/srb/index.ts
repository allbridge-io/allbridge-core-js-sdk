import { Address, Asset, contract, Horizon, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { Big } from "big.js";
import { ChainSymbol } from "../../../chains/chain.enums";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions, ChainType } from "../../../index";
import { FeePaymentMethod } from "../../../models";
import { convertIntAmountToFloat } from "../../../utils/calculation";
import { assertNever } from "../../../utils/utils";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction, TransactionResponse } from "../../models";
import { BridgeContract } from "../../models/srb/bridge-contract";
import { Client as CctpBridgeContract } from "../../models/srb/cctp-bridge-contract";
import { getSorobanInclusionFee, getStellarInclusionFee } from "../../models/srb/utils";
import { getCctpSolTokenRecipientAddress } from "../get-cctp-sol-token-recipient-address";
import {
  ChainBridgeService,
  SendParams,
  SwapParams,
  TxSendParamsSrb,
  TxSwapParamsSol,
  TxTransferParams,
} from "../models";
import { getNonceBigInt, prepareTxSendParams, prepareTxSwapParams } from "../utils";
import ContractClientOptions = contract.ClientOptions;

/**
 * Validity window (seconds) of a classic Stellar transaction built by the SDK.
 */
const STELLAR_TRANSACTION_TIMEOUT = 180;

export class SrbBridgeService extends ChainBridgeService {
  chainType: ChainType.SRB = ChainType.SRB;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions,
    readonly api: AllbridgeCoreClient
  ) {
    super();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    return await this.buildRawTransactionSendFromParams(txSendParams, params);
  }

  async buildRawTransactionSendFromParams(params: TxSendParamsSrb, sendParams?: SendParams): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = params;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }
    const inclusionFee = await getSorobanInclusionFee(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    if (params.messenger === Messenger.CCTP_V2) {
      const contract = this.getContract(CctpBridgeContract, contractAddress, fromAccountAddress);
      const recipient =
        sendParams?.destinationToken.chainType === ChainType.SOLANA
          ? await getCctpSolTokenRecipientAddress(
              this.chainType,
              sendParams.toAccountAddress,
              sendParams.destinationToken.tokenAddress,
              this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL)
            )
          : toAccountAddress;
      if (gasFeePaymentMethod === FeePaymentMethod.WITH_ABR) {
        throw new SdkError("SRB CCTPv2 bridge does not support ABR payment method");
      }
      let cctpFee: { gas_amount: bigint; fee_token_amount: bigint };
      switch (gasFeePaymentMethod) {
        case FeePaymentMethod.WITH_NATIVE_CURRENCY:
          cctpFee = { gas_amount: BigInt(totalFee), fee_token_amount: 0n };
          break;
        case FeePaymentMethod.WITH_STABLECOIN:
          cctpFee = { gas_amount: 0n, fee_token_amount: BigInt(totalFee) };
          break;
        default:
          return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }

      return (
        await contract.bridge(
          {
            sender: fromAccountAddress,
            amount: BigInt(amount),
            recipient: Buffer.from(recipient),
            destination_chain_id: +toChainId,
            ...cctpFee,
          },
          { fee: inclusionFee as unknown as string }
        )
      ).toXDR();
    }

    const contract = this.getContract(BridgeContract, contractAddress, fromAccountAddress);
    let tx;
    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY:
        tx = await contract.swap_and_bridge(
          {
            sender: fromAccountAddress,
            token: Address.contract(Buffer.from(fromTokenAddress)).toString(),
            amount: BigInt(amount),
            recipient: Buffer.from(toAccountAddress),
            destination_chain_id: +toChainId,
            receive_token: Buffer.from(toTokenAddress),
            nonce: getNonceBigInt(),
            gas_amount: BigInt(totalFee),
            fee_token_amount: BigInt(0),
          },
          { fee: inclusionFee }
        );
        break;
      case FeePaymentMethod.WITH_STABLECOIN:
        tx = await contract.swap_and_bridge(
          {
            sender: fromAccountAddress,
            token: Address.contract(Buffer.from(fromTokenAddress)).toString(),
            amount: BigInt(amount),
            recipient: Buffer.from(toAccountAddress),
            destination_chain_id: +toChainId,
            receive_token: Buffer.from(toTokenAddress),
            nonce: getNonceBigInt(),
            gas_amount: BigInt(0),
            fee_token_amount: BigInt(totalFee),
          },
          { fee: inclusionFee }
        );
        break;
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("SRB bridge does not support ABR payment method");
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    return tx.toXDR();
  }

  /**
   * Builds a classic Stellar `payment` of `amount` to `params.toAddress` with `params.memo` as the text memo:
   * XLM when `token.isNative`, otherwise the classic asset behind the Soroban token
   * (`token.originTokenAddress` = `CODE:ISSUER`). Used for `Messenger.NEAR_INTENTS` deposits.
   * @returns the transaction XDR
   * @throws SdkError if `params.memo` is missing: NEAR Intents cannot attribute a Stellar deposit without it
   */
  async buildRawTransactionTransfer(params: TxTransferParams): Promise<RawTransaction> {
    const { amount, token, fromAccountAddress, toAddress, memo } = params;
    if (!memo) {
      throw new SdkError("Stellar transfer requires a deposit memo");
    }
    const asset = token.isNative ? Asset.native() : getClassicAsset(token.originTokenAddress);

    const stellar = new Horizon.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const sourceAccount = await stellar.loadAccount(fromAccountAddress);
    const inclusionFee = await getStellarInclusionFee(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    return new TransactionBuilder(sourceAccount, {
      fee: inclusionFee.toString(10),
      networkPassphrase: this.params.sorobanNetworkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: toAddress,
          asset,
          amount: convertIntAmountToFloat(amount, token.decimals).toFixed(),
        })
      )
      .addMemo(Memo.text(memo))
      .setTimeout(STELLAR_TRANSACTION_TIMEOUT)
      .build()
      .toXDR();
  }

  /** @deprecated Do not use. */
  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  /** @deprecated Do not use. */
  async buildRawTransactionSwapFromParams(params: TxSwapParamsSol): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toAccountAddress,
      toTokenAddress,
      minimumReceiveAmount,
    } = params;
    const contract = this.getContract(BridgeContract, contractAddress, fromAccountAddress);
    const inclusionFee = await getSorobanInclusionFee(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    return (
      await contract.swap(
        {
          sender: fromAccountAddress,
          amount: BigInt(amount),
          token: Address.contract(Buffer.from(fromTokenAddress)).toBuffer(),
          receive_token: Buffer.from(toTokenAddress),
          recipient: toAccountAddress,
          receive_amount_min: BigInt(minimumReceiveAmount),
        },
        { fee: inclusionFee }
      )
    ).toXDR();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  private getContract<T>(contract: new (args: ContractClientOptions) => T, address: string, sender?: string): T {
    const config: ContractClientOptions = {
      publicKey: sender,
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new contract(config);
  }
}

function getClassicAsset(originTokenAddress: string | undefined): Asset {
  const [code, issuer] = originTokenAddress?.split(":") ?? [];
  if (!code || !issuer) {
    throw new SdkError("SRB token must contain 'originTokenAddress' in the 'CODE:ISSUER' format");
  }
  return new Asset(code, issuer);
}
