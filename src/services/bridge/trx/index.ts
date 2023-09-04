import Big from "big.js";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { SdkError } from "../../../exceptions";
import { FeePaymentMethod, SwapParams, TransactionResponse } from "../../../models";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { sendRawTransaction } from "../../utils/trx";
import { SendParams, TxSendParams, TxSwapParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronBridgeService extends ChainBridgeService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(public tronWeb: typeof TronWeb, public api: AllbridgeCoreClient) {
    super();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionSendFromParams(params);
    return await sendRawTransaction(this.tronWeb, rawTransaction);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  async buildRawTransactionSwapFromParams(params: TxSwapParams): Promise<RawTransaction> {
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
    return this.buildRawTransactionSendFromParams(txSendParams);
  }

  async buildRawTransactionSendFromParams(params: TxSendParams): Promise<RawTransaction> {
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
    } = params;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    const nonce = getNonce().toJSON().data;
    let parameters;
    let value: string;
    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
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
    } else {
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
    }
    const methodSignature = "swapAndBridge(bytes32,uint256,bytes32,uint256,bytes32,uint256,uint8,uint256)";
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
        callValue: value,
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
