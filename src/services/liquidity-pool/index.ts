import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { PoolInfo, TokenInfoWithChainDetails } from "../../tokens-info";
import { convertFloatAmountToInt, convertIntAmountToFloat, fromSystemPrecision } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, RawTransaction } from "../models";
import { depositAmountToVUsd, vUsdToWithdrawalAmount } from "../utils/calculation";
import { EvmPool } from "./evm";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, Pool, UserBalanceInfo } from "./models";
import { SolanaPool, SolanaPoolParams } from "./sol";
import { TronPool } from "./trx";

export class LiquidityPoolService {
  constructor(public api: AllbridgeCoreClient, public solParams: SolanaPoolParams) {}

  async getAmountToBeDeposited(amount: string, token: TokenInfoWithChainDetails, provider?: Provider): Promise<string> {
    const poolInfo = await this.getPoolInfo(token, provider);
    const { vUsdBalance, tokenBalance, aValue, dValue, totalLpAmount } = poolInfo;
    const vUsd = depositAmountToVUsd(amount, aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount);
    return convertIntAmountToFloat(vUsd, SYSTEM_PRECISION).toFixed();
  }

  async getAmountToBeWithdrawn(
    amount: string,
    accountAddress: string,
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<string> {
    const poolInfo = await this.getPoolInfo(token, provider);
    const { vUsdBalance, tokenBalance, aValue, dValue, totalLpAmount } = poolInfo;
    const tokenAmountInSP = vUsdToWithdrawalAmount(amount, aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount);
    const tokenAmount = fromSystemPrecision(tokenAmountInSP, token.decimals);
    const userBalanceInfo = await this.getUserBalanceInfo(accountAddress, token, provider);
    const earned = userBalanceInfo.earned(poolInfo) || "0";
    const commonAmount = Big(tokenAmount).plus(earned).toFixed();
    return convertIntAmountToFloat(commonAmount, token.decimals).toFixed();
  }

  async getUserBalanceInfo(
    accountAddress: string,
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<UserBalanceInfo> {
    return this.getPool(provider).getUserBalanceInfo(accountAddress, token);
  }

  getPoolInfo(token: TokenInfoWithChainDetails, provider?: Provider): Promise<PoolInfo> {
    return this.getPool(provider).getPoolInfo(token);
  }

  async buildRawTransactionDeposit(
    params: LiquidityPoolsParamsWithAmount,
    provider?: Provider
  ): Promise<RawTransaction> {
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toString();
    return this.getPool(provider).buildRawTransactionDeposit(params);
  }

  async buildRawTransactionWithdraw(
    params: LiquidityPoolsParamsWithAmount,
    provider?: Provider
  ): Promise<RawTransaction> {
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toString();
    return this.getPool(provider).buildRawTransactionWithdraw(params);
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return this.getPool(provider).buildRawTransactionClaimRewards(params);
  }

  private getPool(provider?: Provider): Pool {
    if (!provider) {
      return new SolanaPool(this.solParams, this.api);
    }
    if (this.isTronWeb(provider)) {
      return new TronPool(provider, this.api);
    } else {
      // Web3
      return new EvmPool(provider as unknown as Web3, this.api);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }
}
