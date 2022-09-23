/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from "crypto";
import BN from "bn.js";
import erc20abi from "erc-20-abi";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import {
  ApprovalBridge,
  ApproveData,
  GetTokenBalanceData,
  SendParams,
  TransactionResponse,
} from "../../models";
import abi from "./abi/Abi.json";
import { Abi as Bridge } from "./types/Abi";
import { BaseContract } from "./types/types";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class EvmBridge extends ApprovalBridge {
  constructor(public web3: Web3) {
    super();
  }

  getTokenBalance(data: GetTokenBalanceData): Promise<string> {
    return this.getContract(erc20abi as AbiItem[], data.tokenAddress)
      .methods.balanceOf(data.account)
      .call();
  }

  async send(params: SendParams): Promise<TransactionResponse> {
    const {
      account,
      contractAddress,
      tokenAddress,
      amount,
      receiverAddress,
      destinationChainId,
      receiveTokenAddress,
      messenger,
      fee,
    } = params;
    const formattedReceiveAddress = EvmBridge.formatAddress(receiverAddress);
    const formattedTokenAddress = EvmBridge.formatAddress(tokenAddress);
    const formattedReceiveTokenAddress =
      EvmBridge.formatAddress(receiveTokenAddress);
    const bridgeContract = this.getBridgeContract(contractAddress);
    const nonce = new BN(EvmBridge.getNonce());

    const swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
      formattedTokenAddress,
      amount,
      formattedReceiveAddress,
      destinationChainId,
      formattedReceiveTokenAddress,
      nonce,
      messenger
    );
    const estimateGas = await swapAndBridgeMethod.estimateGas({
      from: account,
      value: fee,
    });

    const { transactionHash } = await swapAndBridgeMethod.send({
      from: account,
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

  private static formatAddress(address: string): string {
    return "0x" + EvmBridge.evmAddressToBuffer32(address).toString("hex");
  }

  private static evmAddressToBuffer32(address: string): Buffer {
    const length = 32;
    const buff = EvmBridge.hexToBuffer(address);
    return Buffer.concat([Buffer.alloc(length - buff.length, 0), buff], length);
  }

  private static hexToBuffer(hex: string): Buffer {
    return Buffer.from(hex.replace(/^0x/i, ""), "hex");
  }

  private static getNonce(): Buffer {
    return crypto.randomBytes(32);
  }
}
