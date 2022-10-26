/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TronWeb } from "tronweb-typings";
import { ChainType } from "../../chains";
import {
  ApprovalBridge,
  ApproveData,
  GetTokenBalanceData,
  TransactionResponse,
  TxSendParams,
} from "../models";
import { getNonce, sleep } from "../utils";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronBridge extends ApprovalBridge {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(public tronWeb: TronWeb) {
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
      // @ts-expect-error get existing trx property
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
}
