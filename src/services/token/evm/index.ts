import BN from "bn.js";
import { Contract, Transaction as Web3Transaction } from "web3";
import { ChainSymbol, ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { GetTokenBalanceParams, EssentialWeb3, TransactionResponse } from "../../../models";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction } from "../../models";
import ERC20 from "../../models/abi/ERC20";
import { amountToHex } from "../../utils";
import { ApproveParamsDto, GetAllowanceParamsDto, ChainTokenService } from "../models";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const USDT_TOKEN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const POLYGON_GAS_LIMIT = 100_000;

export class EvmTokenService extends ChainTokenService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(
    public web3: EssentialWeb3,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    const tokenAddress = params.token.tokenAddress;
    const owner = params.owner;
    const spender = params.spender;
    return this.getAllowanceByTokenAddress(tokenAddress, owner, spender);
  }

  getAllowanceByTokenAddress(tokenAddress: string, owner: string, spender: string): Promise<string> {
    const tokenContract = this.getERC20Contract(tokenAddress);
    return tokenContract.methods.allowance(owner, spender).call();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    return await this.getERC20Contract(params.token.tokenAddress).methods.balanceOf(params.account).call();
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    return (await this.web3.eth.getBalance(params.account)).toString();
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

  buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
    const { tokenAddress, spender, owner, amount } = params;
    const tokenContract = this.getERC20Contract(tokenAddress);

    const approveMethod = tokenContract.methods.approve(
      spender,
      amount == undefined ? MAX_AMOUNT : amountToHex(amount)
    );

    return Promise.resolve({
      from: owner,
      to: tokenAddress,
      value: "0",
      data: approveMethod.encodeABI(),
    });
  }

  private async sendRawTransaction(rawTransaction: RawTransaction, chainSymbol: string) {
    const transactionConfig: Web3Transaction = rawTransaction as Web3Transaction;
    // prettier-ignore
    const feeOptions: {
      maxPriorityFeePerGas?: number | string | BN;
      maxFeePerGas?: number | string | BN
    } = {maxPriorityFeePerGas: undefined, maxFeePerGas: undefined};
    if ((chainSymbol as ChainSymbol) === ChainSymbol.POL) {
      transactionConfig.gas = POLYGON_GAS_LIMIT;
    } else {
      transactionConfig.gas = await this.web3.eth.estimateGas(rawTransaction as Web3Transaction);
    }
    const { transactionHash } = await this.web3.eth.sendTransaction({
      ...transactionConfig,
      ...feeOptions,
    } as Web3Transaction);
    return { txId: transactionHash.toString() };
  }

  private getERC20Contract(contractAddress: string) {
    return new this.web3.eth.Contract(ERC20.abi, contractAddress) as Contract<typeof ERC20.abi>;
  }
}
