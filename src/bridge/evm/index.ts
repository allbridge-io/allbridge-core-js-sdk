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
import { chainProperties, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { BridgeService } from "../index";
import {
  ApprovalBridge,
  ApproveData,
  GetTokenBalanceData,
  TxSendParams,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "../models";
import { formatAddress } from "../utils";
import abi from "./abi/Abi.json";
import { Abi as Bridge } from "./types/Abi";
import { BaseContract } from "./types/types";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class EvmBridge extends ApprovalBridge {
  constructor(public api: AllbridgeCoreClient, public web3: Web3) {
    super();
  }

  getTokenBalance(data: GetTokenBalanceData): Promise<string> {
    return this.getContract(erc20abi as AbiItem[], data.tokenAddress)
      .methods.balanceOf(data.account)
      .call();
  }

  async send(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    let contractAddress;
    let fromChainId;
    let fromTokenAddress;
    let toChainType;
    let toChainId;
    let toTokenAddress;
    if (BridgeService.isSendParamsWithChainSymbol(params)) {
      const tokensInfo = await this.api.getTokensInfo();
      const chainDetailsMap = tokensInfo.chainDetailsMap();

      contractAddress = chainDetailsMap[params.fromChainSymbol].bridgeAddress;
      fromChainId = chainDetailsMap[params.fromChainSymbol].allbridgeChainId;
      fromTokenAddress = params.fromTokenAddress;
      toChainType = chainProperties[params.toChainSymbol].chainType;
      toChainId = chainDetailsMap[params.toChainSymbol].allbridgeChainId;
      toTokenAddress = params.toTokenAddress;
    } else {
      contractAddress = params.sourceChainToken.bridgeAddress;
      fromChainId = params.sourceChainToken.allbridgeChainId;
      fromTokenAddress = params.sourceChainToken.tokenAddress;
      toChainType =
        chainProperties[params.destinationChainToken.chainSymbol].chainType;
      toChainId = params.destinationChainToken.allbridgeChainId;
      toTokenAddress = params.destinationChainToken.tokenAddress;
    }

    const { amount, fromAccountAddress, toAccountAddress, messenger } = params;
    let { fee } = params;

    if (fee == null) {
      fee = await this.api.getReceiveTransactionCost({
        sourceChainId: fromChainId,
        destinationChainId: toChainId,
        messenger,
      });
    }

    return this.sendTx({
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toChainType,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      messenger,
      fee,
    });
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toChainType,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      messenger,
      fee,
    } = params;

    const formattedFromTokenAddress = formatAddress(
      fromTokenAddress,
      ChainType.EVM,
      ChainType.EVM
    );
    const formattedToAccountAddress = formatAddress(
      toAccountAddress,
      toChainType,
      ChainType.EVM
    );
    const formattedToTokenAddress = formatAddress(
      toTokenAddress,
      toChainType,
      ChainType.EVM
    );

    const bridgeContract = this.getBridgeContract(contractAddress);
    const nonce = new BN(EvmBridge.getNonce());

    const swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
      formattedFromTokenAddress,
      amount,
      formattedToAccountAddress,
      toChainId,
      formattedToTokenAddress,
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

  private static getNonce(): Buffer {
    return crypto.randomBytes(32);
  }
}
