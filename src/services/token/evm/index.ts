import BN from "bn.js";
import erc20abi from "erc-20-abi";
import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { GetTokenBalanceParams, TransactionResponse } from "../../../models";
import { RawTransaction } from "../../models";
import { BaseContract } from "../../models/abi/types/types";
import { amountToHex } from "../../utils/index";
import { ApproveParamsDto, GetAllowanceParamsDto } from "../models";
import { ChainTokenService } from "../models/token";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const USDT_TOKEN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const POLYGON_GAS_LIMIT = 100_000;

export class EvmTokenService extends ChainTokenService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(public web3: Web3, public api: AllbridgeCoreClient) {
    super();
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    const tokenAddress = params.token.tokenAddress;
    const owner = params.owner;
    const spender = params.spender;
    return this.getAllowanceByTokenAddress(tokenAddress, owner, spender);
  }

  getAllowanceByTokenAddress(tokenAddress: string, owner: string, spender: string): Promise<string> {
    const tokenContract = this.getContract(erc20abi as AbiItem[], tokenAddress);
    return tokenContract.methods.allowance(owner, spender).call();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    return await this.getContract(erc20abi as AbiItem[], params.token.tokenAddress)
      .methods.balanceOf(params.account)
      .call();
  }

  async approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    if (this.isUsdt(params.tokenAddress)) {
      const allowance = await this.getAllowanceByTokenAddress(params.tokenAddress, params.owner, params.spender);
      if (allowance !== "0") {
        const rawTransaction = await this.buildRawTransactionApprove({
          ...params,
          amount: "0",
        });
        await this.sendRawTransaction(rawTransaction, params.chainSymbol);
      }
    }
    const rawTransaction = await this.buildRawTransactionApprove(params);
    return await this.sendRawTransaction(rawTransaction, params.chainSymbol);
  }

  isUsdt(tokenAddress: string): boolean {
    return tokenAddress.toLowerCase() === USDT_TOKEN_ADDRESS;
  }

  async buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
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
    };
  }

  private async sendRawTransaction(rawTransaction: RawTransaction, chainSymbol: ChainSymbol) {
    const transactionConfig: TransactionConfig = rawTransaction as TransactionConfig;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error DISABLE SITE SUGGESTED GAS FEE IN METAMASK
    // prettier-ignore
    const feeOptions: { maxPriorityFeePerGas?: number | string | BN; maxFeePerGas?: number | string | BN } = { maxPriorityFeePerGas: null, maxFeePerGas: null };
    if (chainSymbol == ChainSymbol.POL) {
      transactionConfig.gas = POLYGON_GAS_LIMIT;
    } else {
      transactionConfig.gas = await this.web3.eth.estimateGas(rawTransaction as TransactionConfig);
    }
    const { transactionHash } = await this.web3.eth.sendTransaction({ ...transactionConfig, ...feeOptions });
    return { txId: transactionHash };
  }

  private getContract<T extends BaseContract>(abiItem: AbiItem[], contractAddress: string): T {
    return new this.web3.eth.Contract(abiItem, contractAddress) as any;
  }
}
