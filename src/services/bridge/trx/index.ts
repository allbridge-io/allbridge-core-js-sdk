// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { FeePaymentMethod, TransactionResponse } from "../../../models";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { sleep } from "../../utils";
import { SendParams, TxSendParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams } from "../utils";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronBridgeService extends ChainBridgeService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(public tronWeb: typeof TronWeb, public api: AllbridgeCoreClient) {
    super();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionSendFromParams(params);
    return await this.sendRawTransaction(rawTransaction);
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
    } = params;

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
        { type: "uint256", value: fee },
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
      value = fee;
    }
    const methodSignature = "swapAndBridge(bytes32,uint256,bytes32,uint256,bytes32,uint256,uint8,uint256)";
    return this.buildRawTransaction(contractAddress, methodSignature, parameters, value, fromAccountAddress);
  }

  private async verifyTx(txId: string, timeout = 10000): Promise<any> {
    const start = Date.now();
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition */
    while (true) {
      if (Date.now() - start > timeout) {
        throw new Error("Transaction not found");
      }
      const result = await this.tronWeb.trx.getUnconfirmedTransactionInfo(txId);
      if (!result?.receipt) {
        await sleep(2000);
        continue;
      }
      if (result.receipt.result === "SUCCESS") {
        return result;
      } else {
        /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
        throw new Error(`Transaction status is ${result.receipt.result}`);
      }
    }
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
      throw Error("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private async sendRawTransaction(rawTransaction: RawTransaction) {
    const signedTx = await this.tronWeb.trx.sign(rawTransaction);

    if (!signedTx.signature) {
      throw Error("Transaction was not signed properly");
    }

    const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);

    const transactionHash = receipt.transaction.txID;
    await this.verifyTx(transactionHash);
    return { txId: transactionHash };
  }
}
