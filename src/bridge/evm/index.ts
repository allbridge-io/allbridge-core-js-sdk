/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import BN from "bn.js";
import erc20abi from "erc-20-abi";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { AllbridgeCoreClient } from "../../client/core-api";
import {
  ApprovalBridge,
  ApproveData,
  GetTokenBalanceData,
  TxSendParams,
  TransactionResponse,
} from "../models";
import { getNonce } from "../utils";
import abi from "./abi/Abi.json";
import { Abi as Bridge } from "./types/Abi";
import { BaseContract } from "./types/types";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class EvmBridge extends ApprovalBridge {
  constructor(public api: AllbridgeCoreClient, public web3: Web3) {
    super();
  }

  async getTokenBalance(data: GetTokenBalanceData): Promise<string> {
    return await this.getContract(erc20abi as AbiItem[], data.tokenAddress)
      .methods.balanceOf(data.account)
      .call();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
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

    const bridgeContract = this.getBridgeContract(contractAddress);
    const nonce = new BN(getNonce());

    const swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
      fromTokenAddress,
      amount,
      toAccountAddress,
      toChainId,
      toTokenAddress,
      nonce,
      messenger
    );
    const estimateGas = await swapAndBridgeMethod.estimateGas({
      from: fromAccountAddress,
      value: fee,
    });

    const { transactionHash } = await swapAndBridgeMethod.send({
      from: fromAccountAddress,
      value: fee,
      gas: estimateGas,
    });
    return { txId: transactionHash };
  }

  async approve(approveData: ApproveData): Promise<TransactionResponse> {
    const { tokenAddress, spender, owner } = approveData;
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);

    const approveMethod = await tokenContract.methods.approve(
      spender,
      MAX_AMOUNT
    );
    const estimateGas = await approveMethod.estimateGas({ from: owner });

    const { transactionHash } = await approveMethod.send({
      from: owner,
      gas: estimateGas,
    });
    return { txId: transactionHash };
  }

  getAllowance(approveData: ApproveData): Promise<string> {
    const { tokenAddress, spender, owner } = approveData;
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);
    return tokenContract.methods.allowance(owner, spender).call();
  }

  private getContract<T extends BaseContract>(
    abiItem: AbiItem[],
    contractAddress: string
  ): T {
    return new this.web3.eth.Contract(abiItem, contractAddress) as any;
  }

  private getBridgeContract(contractAddress: string): Bridge {
    return this.getContract<Bridge>(abi as AbiItem[], contractAddress);
  }
}
