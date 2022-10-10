/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import BN from "bn.js";
import erc20abi from "erc-20-abi";
import randomBytes from "randombytes";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { ChainDetailsMap } from "../../tokens-info";
import { convertFloatAmountToInt } from "../../utils/calculation";
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
    const txSendParams = {} as TxSendParams;
    let fromChainId;
    let toChainType;

    if (BridgeService.isSendParamsWithChainSymbol(params)) {
      const chainDetailsMap = (
        await this.api.getTokensInfo()
      ).chainDetailsMap();
      fromChainId = chainDetailsMap[params.fromChainSymbol].allbridgeChainId;
      toChainType = chainProperties[params.toChainSymbol].chainType;
      txSendParams.contractAddress =
        chainDetailsMap[params.fromChainSymbol].bridgeAddress;
      txSendParams.fromTokenAddress = params.fromTokenAddress;
      txSendParams.toChainId =
        chainDetailsMap[params.toChainSymbol].allbridgeChainId;
      txSendParams.toTokenAddress = params.toTokenAddress;
      txSendParams.amount = convertFloatAmountToInt(
        params.amount,
        this.getDecimalsByContractAddress(
          chainDetailsMap,
          params.fromChainSymbol,
          txSendParams.fromTokenAddress
        )
      ).toFixed();
    } else {
      fromChainId = params.sourceChainToken.allbridgeChainId;
      toChainType =
        chainProperties[params.destinationChainToken.chainSymbol].chainType;
      txSendParams.contractAddress = params.sourceChainToken.bridgeAddress;
      txSendParams.fromTokenAddress = params.sourceChainToken.tokenAddress;
      txSendParams.toChainId = params.destinationChainToken.allbridgeChainId;
      txSendParams.toTokenAddress = params.destinationChainToken.tokenAddress;
      txSendParams.amount = convertFloatAmountToInt(
        params.amount,
        params.sourceChainToken.decimals
      ).toFixed();
    }
    txSendParams.messenger = params.messenger;
    txSendParams.fromAccountAddress = params.fromAccountAddress;

    let { fee } = params;
    if (fee == null) {
      fee = await this.api.getReceiveTransactionCost({
        sourceChainId: fromChainId,
        destinationChainId: txSendParams.toChainId,
        messenger: txSendParams.messenger,
      });
    }
    txSendParams.fee = fee;

    txSendParams.fromTokenAddress = formatAddress(
      txSendParams.fromTokenAddress,
      ChainType.EVM,
      ChainType.EVM
    );
    txSendParams.toAccountAddress = formatAddress(
      params.toAccountAddress,
      toChainType,
      ChainType.EVM
    );
    txSendParams.toTokenAddress = formatAddress(
      txSendParams.toTokenAddress,
      toChainType,
      ChainType.EVM
    );

    return this.sendTx(txSendParams);
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
    const nonce = new BN(EvmBridge.getNonce());

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

  private static getNonce(): Buffer {
    return randomBytes(32);
  }

  private getDecimalsByContractAddress(
    chainDetailsMap: ChainDetailsMap,
    chainSymbol: ChainSymbol,
    contractAddress: string
  ): number {
    const sourceTokenInfoWithChainDetails = chainDetailsMap[
      chainSymbol
    ].tokens.find(
      (value) =>
        value.tokenAddress.toUpperCase() === contractAddress.toUpperCase()
    );
    if (!sourceTokenInfoWithChainDetails) {
      throw new Error("Cannot find source token info");
    }
    return sourceTokenInfoWithChainDetails.decimals;
  }
}
