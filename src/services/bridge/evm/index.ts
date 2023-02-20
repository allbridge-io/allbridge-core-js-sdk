import BN from "bn.js";
import erc20abi from "erc-20-abi";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction } from "../../models";
import {
  ApproveParamsDto,
  Bridge,
  GetAllowanceParamsDto,
  GetTokenBalanceParamsWithTokenAddress,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
  TxSendParams,
} from "../models";
import { amountToHex, getNonce, prepareTxSendParams } from "../utils";
import abi from "./abi/Abi.json";
import { Abi as BridgeContract } from "./types/Abi";
import { BaseContract } from "./types/types";

export const MAX_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const USDT_TOKEN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";

export class EvmBridge extends Bridge {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(public web3: Web3, public api: AllbridgeCoreClient) {
    super();
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    const {
      tokenInfo: { tokenAddress, poolAddress: spender },
      owner,
    } = params;
    return this.getAllowanceByTokenAddress(tokenAddress, owner, spender);
  }

  getAllowanceByTokenAddress(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);
    return tokenContract.methods.allowance(owner, spender).call();
  }

  async getTokenBalance(
    params: GetTokenBalanceParamsWithTokenAddress
  ): Promise<string> {
    return await this.getContract(erc20abi as AbiItem[], params.tokenAddress)
      .methods.balanceOf(params.account)
      .call();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const rawTransaction = this.buildRawTransactionSendFromParams(params);
    return this.sendRawTransaction(rawTransaction);
  }

  async buildRawTransactionSend(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(
      this.chainType,
      params,
      this.api
    );
    return this.buildRawTransactionSendFromParams(txSendParams);
  }

  buildRawTransactionSendFromParams(params: TxSendParams): RawTransaction {
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

    return {
      from: fromAccountAddress,
      to: contractAddress,
      value: fee,
      data: swapAndBridgeMethod.encodeABI(),
      type: 2,
    };
  }

  async approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    if (this.isUsdt(params.tokenAddress)) {
      const allowance = await this.getAllowanceByTokenAddress(
        params.tokenAddress,
        params.owner,
        params.spender
      );
      if (allowance !== "0") {
        const rawTransaction = await this.buildRawTransactionApprove({
          ...params,
          amount: "0",
        });
        await this.sendRawTransaction(rawTransaction);
      }
    }
    const rawTransaction = await this.buildRawTransactionApprove(params);
    return await this.sendRawTransaction(rawTransaction);
  }

  isUsdt(tokenAddress: string): boolean {
    return tokenAddress.toLowerCase() === USDT_TOKEN_ADDRESS;
  }

  async buildRawTransactionApprove(
    params: ApproveParamsDto
  ): Promise<RawTransaction> {
    const { tokenAddress, spender, owner, amount } = params;
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);

    const approveMethod = await tokenContract.methods.approve(
      spender,
      amount == undefined ? MAX_AMOUNT : amountToHex(amount)
    );
    return {
      from: owner,
      to: tokenAddress,
      value: "0",
      data: approveMethod.encodeABI(),
      type: 2,
    };
  }

  private async sendRawTransaction(rawTransaction: RawTransaction) {
    const estimateGas = await this.web3.eth.estimateGas(rawTransaction);
    // @ts-expect-error access raw transaction field
    const account = this.web3.eth.accounts.wallet[rawTransaction.from];
    const signTxReceipt = await account.signTransaction({
      ...rawTransaction,
      gas: estimateGas,
    });
    const { transactionHash } = await this.web3.eth.sendSignedTransaction(
      // @ts-expect-error access signTxReceipt field
      signTxReceipt.rawTransaction
    );
    return { txId: transactionHash };
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
