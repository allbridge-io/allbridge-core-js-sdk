import { Big } from "big.js";
import { TronWeb } from "tronweb";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { FeePaymentMethod, Messenger, SwapParams, TransactionResponse } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { sendRawTransaction } from "../../utils/trx";
import { SendParams, TxSendParamsTrx, TxSwapParamsTrx } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonceBigInt, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class TronBridgeService extends ChainBridgeService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(
    public tronWeb: TronWeb,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async send(params: SendParams): Promise<TransactionResponse> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    const rawTransaction = await this.buildRawTransactionSendFromParams(params, txSendParams);
    return await sendRawTransaction(this.tronWeb, rawTransaction);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  async buildRawTransactionSwapFromParams(params: TxSwapParamsTrx): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toAccountAddress,
      toTokenAddress,
      minimumReceiveAmount,
    } = params;

    const parameters = [
      { type: "uint256", value: amount },
      { type: "bytes32", value: fromTokenAddress },
      { type: "bytes32", value: toTokenAddress },
      { type: "address", value: toAccountAddress },
      { type: "uint256", value: minimumReceiveAmount },
    ];
    const methodSignature = "swap(uint256,bytes32,bytes32,address,uint256)";
    return this.buildRawTransaction(contractAddress, methodSignature, parameters, "0", fromAccountAddress);
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    return this.buildRawTransactionSendFromParams(params, txSendParams);
  }

  async buildRawTransactionSendFromParams(sendParams: SendParams, params: TxSendParamsTrx): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      messenger,
      fee,
      gasFeePaymentMethod,
      extraGas,
      extraGasDest,
    } = params;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    const nonce = getNonceBigInt().toString();
    let parameters;
    let value: string;
    let methodSignature: string;
    switch (messenger) {
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        switch (gasFeePaymentMethod) {
          case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
            parameters = [
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "uint256", value: 0 },
            ];
            value = totalFee;
            break;
          }
          case FeePaymentMethod.WITH_STABLECOIN: {
            parameters = [
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "uint256", value: totalFee },
            ];
            value = "0";
            break;
          }
          case FeePaymentMethod.WITH_ABR:
            throw new SdkError("TRX bridge does not support ABR payment method");
          default: {
            return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
          }
        }
        methodSignature = "bridge(uint256,bytes32,uint256,uint256)";
        break;
      case Messenger.OFT:
        switch (gasFeePaymentMethod) {
          case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
            parameters = [
              { type: "address", value: sendParams.sourceToken.tokenAddress },
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "uint256", value: 0 },
              { type: "uint256", value: extraGasDest ?? "0" },
              { type: "uint256", value: "10" },
            ];
            value = totalFee;
            break;
          }
          case FeePaymentMethod.WITH_STABLECOIN: {
            parameters = [
              { type: "address", value: sendParams.sourceToken.tokenAddress },
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "uint256", value: totalFee },
              { type: "uint256", value: extraGasDest ?? "0" },
              { type: "uint256", value: "10" },
            ];
            value = "0";
            break;
          }
          case FeePaymentMethod.WITH_ABR:
            throw new SdkError("TRX bridge does not support ABR payment method");
          default: {
            return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
          }
        }
        methodSignature = "bridge(address,uint256,bytes32,uint256,uint256,uint256,uint256)";
        break;
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE:
        switch (gasFeePaymentMethod) {
          case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
            parameters = [
              { type: "bytes32", value: fromTokenAddress },
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "bytes32", value: toTokenAddress },
              { type: "uint256", value: nonce },
              { type: "uint8", value: messenger },
              { type: "uint256", value: 0 },
            ];
            value = totalFee;
            break;
          }
          case FeePaymentMethod.WITH_STABLECOIN: {
            parameters = [
              { type: "bytes32", value: fromTokenAddress },
              { type: "uint256", value: amount },
              { type: "bytes32", value: toAccountAddress },
              { type: "uint256", value: toChainId },
              { type: "bytes32", value: toTokenAddress },
              { type: "uint256", value: nonce },
              { type: "uint8", value: messenger },
              { type: "uint256", value: totalFee },
            ];
            value = "0";
            break;
          }
          case FeePaymentMethod.WITH_ABR:
            throw new SdkError("TRX bridge does not support ABR payment method");
          default: {
            return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
          }
        }
        methodSignature = "swapAndBridge(bytes32,uint256,bytes32,uint256,bytes32,uint256,uint8,uint256)";
        break;
    }
    return this.buildRawTransaction(contractAddress, methodSignature, parameters, value, fromAccountAddress);
  }

  private async buildRawTransaction(
    contractAddress: string,
    methodSignature: string,
    parameters: SmartContractMethodParameter[],
    value: string,
    fromAddress: string
  ): Promise<RawTransaction> {
    const transactionObject = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      methodSignature,
      {
        callValue: +value,
      },
      parameters,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw new SdkError("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }
}
