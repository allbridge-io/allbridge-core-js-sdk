// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { ChainType } from "../../chains";
import {
  ApproveData,
  Bridge,
  GetTokenBalanceData,
  RawTransaction,
  SmartContractMethodParameter,
  TransactionResponse,
  TxSendParams,
} from "../models";
import { getNonce, sleep } from "../utils";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronBridge extends Bridge {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(public tronWeb: typeof TronWeb) {
    super();
  }

  async getTokenBalance(data: GetTokenBalanceData): Promise<string> {
    const contract = await this.getContract(data.tokenAddress);
    const balance = await contract.balanceOf(data.account).call();
    return balance.toString();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const {
      amount,
      contractAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      messenger,
      fee,
    } = params;

    const bridgeContract = await this.getContract(contractAddress);
    const nonce = getNonce().toJSON().data;

    const swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
      fromTokenAddress,
      amount,
      toAccountAddress,
      toChainId,
      toTokenAddress,
      nonce,
      messenger
    );

    const transactionHash = await swapAndBridgeMethod.send({
      callValue: fee,
    });
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
    await this.verifyTx(transactionHash);
    return { txId: transactionHash };
  }

  async buildRawTransactionSend(params: TxSendParams): Promise<RawTransaction> {
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
    } = params;

    const nonce = getNonce().toJSON().data;
    const parameter = [
      { type: "bytes32", value: fromTokenAddress },
      { type: "uint256", value: amount },
      { type: "bytes32", value: toAccountAddress },
      { type: "uint8", value: toChainId },
      { type: "bytes32", value: toTokenAddress },
      { type: "uint256", value: nonce },
      { type: "uint8", value: messenger },
    ];
    const value = fee;
    const methodSignature =
      "swapAndBridge(bytes32,uint256,bytes32,uint8,bytes32,uint256,uint8)";

    return this.buildRawTransaction(
      contractAddress,
      methodSignature,
      parameter,
      value,
      fromAccountAddress
    );
  }

  async approve(approveData: ApproveData): Promise<TransactionResponse> {
    const { tokenAddress, spender, owner } = approveData;
    const tokenContract = await this.getContract(tokenAddress);
    const transactionHash = await tokenContract
      .approve(spender, MAX_AMOUNT)
      .send({ from: owner });
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
    await this.verifyTx(transactionHash);
    return { txId: transactionHash };
  }

  async buildRawTransactionApprove(
    approveData: ApproveData
  ): Promise<RawTransaction> {
    const { tokenAddress, spender, owner } = approveData;

    const parameter = [
      { type: "address", value: spender },
      { type: "uint256", value: MAX_AMOUNT },
    ];
    const value = "0";
    const methodSignature = "approve(address,uint256)";

    return this.buildRawTransaction(
      tokenAddress,
      methodSignature,
      parameter,
      value,
      owner
    );
  }

  async getAllowance(approveData: ApproveData): Promise<string> {
    const { tokenAddress, spender, owner } = approveData;
    const tokenContract = await this.getContract(tokenAddress);
    const allowance = await tokenContract.allowance(owner, spender).call();
    return allowance.toString();
  }

  private getContract(contractAddress: string): Promise<any> {
    return this.tronWeb.contract().at(contractAddress);
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
    parameter: SmartContractMethodParameter[],
    value: string,
    fromAddress: string
  ): Promise<RawTransaction> {
    const transactionObject =
      await this.tronWeb.transactionBuilder.triggerSmartContract(
        contractAddress,
        methodSignature,
        {
          callValue: value,
        },
        parameter,
        fromAddress
      );
    if (!transactionObject.result || !transactionObject.result.result) {
      throw Error(
        "Unknown error: " + JSON.stringify(transactionObject, null, 2)
      );
    }
    return transactionObject.transaction;
  }
}
