/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import BN from "bn.js";
import erc20abi from "erc-20-abi";
import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../chains";
import {
  ApproveData,
  Bridge,
  GetTokenBalanceData,
  TransactionResponse,
  TxSendParams,
} from "../models";
import { getNonce } from "../utils";
import abi from "./abi/Abi.json";
import { Abi as BridgeContract } from "./types/Abi";
import { BaseContract } from "./types/types";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class EvmBridge extends Bridge {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(public web3: Web3) {
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

  async buildRawTransactionSend(
    params: TxSendParams
  ): Promise<TransactionConfig> {
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

    return new Promise((resolve) =>
      resolve({
        from: fromAccountAddress,
        to: contractAddress,
        value: fee,
        data: swapAndBridgeMethod.encodeABI(),
        maxFeePerGas: 100000000000,
        maxPriorityFeePerGas: 3000000000,
      })
    );
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

  async buildRawTransactionApprove(
    approveData: ApproveData
  ): Promise<TransactionConfig> {
    const { tokenAddress, spender, owner } = approveData;
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);
    const approveMethod = await tokenContract.methods.approve(
      spender,
      MAX_AMOUNT
    );
    return {
      from: owner,
      to: tokenAddress,
      value: "0",
      data: approveMethod.encodeABI(),
      maxFeePerGas: 100000000000,
      maxPriorityFeePerGas: 3000000000,
    };
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

  private getBridgeContract(contractAddress: string): BridgeContract {
    return this.getContract<BridgeContract>(abi as AbiItem[], contractAddress);
  }
}
