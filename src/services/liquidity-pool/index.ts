import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";
import { calculatePoolInfoImbalance, convertIntAmountToFloat, fromSystemPrecision } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { depositAmountToVUsd, vUsdToWithdrawalAmount } from "../utils/calculation";
import { EvmPoolService } from "./evm";
import { ApproveParams, CheckAllowanceParams, GetAllowanceParams, ChainPoolService, UserBalanceInfo } from "./models";
import { RawTransactionBuilder } from "./raw-transaction-builder";
import { SolanaPoolService, SolanaPoolParams } from "./sol";
import { TronPoolService } from "./trx";

export class LiquidityPoolService {
  public rawTxBuilder: RawTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaPoolParams,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new RawTransactionBuilder(api, solParams, this, tokenService);
  }

  /**
   * Get amount of tokens approved for poolInfo
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  async getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string> {
    const allowanceInt = await this.tokenService.getAllowance(provider, {
      ...params,
      spender: params.token.poolAddress,
    });
    return convertIntAmountToFloat(allowanceInt, params.token.decimals).toFixed();
  }

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  async checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean> {
    return this.tokenService.checkAllowance(provider, { ...params, spender: params.token.poolAddress });
  }

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.tokenService.approve(provider, { ...approveData, spender: approveData.token.poolAddress });
  }

  /**
   * Calculates the amount of LP tokens that will be deposited
   * @param amount The float amount of tokens that will be sent
   * @param token
   * @param provider
   * @returns amount
   */
  async getAmountToBeDeposited(amount: string, token: TokenWithChainDetails, provider?: Provider): Promise<string> {
    const pool = await this.getPoolInfo(token, provider);
    const { vUsdBalance, tokenBalance, aValue, dValue } = pool;
    const vUsd = depositAmountToVUsd(amount, aValue, dValue, tokenBalance, vUsdBalance);
    return convertIntAmountToFloat(vUsd, SYSTEM_PRECISION).toFixed();
  }

  /**
   * Calculates the amount of tokens will be withdrawn
   * @param amount The float amount of tokens that will be sent
   * @param accountAddress
   * @param token
   * @param provider
   * @returns amount
   */
  async getAmountToBeWithdrawn(
    amount: string,
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<string> {
    const pool = await this.getPoolInfo(token, provider);
    const tokenAmountInSP = vUsdToWithdrawalAmount(amount);
    const tokenAmount = fromSystemPrecision(tokenAmountInSP, token.decimals);
    const userBalanceInfo = await this.getUserBalanceInfo(accountAddress, token, provider);
    const earned = userBalanceInfo.earned(pool) || "0";
    const commonAmount = Big(tokenAmount).plus(earned).toFixed();
    return convertIntAmountToFloat(commonAmount, token.decimals).toFixed();
  }

  /**
   * Get User Balance Info on Liquidity poolInfo
   * @param accountAddress
   * @param token
   * @param provider
   * @returns UserBalanceInfo
   */
  async getUserBalanceInfo(
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<UserBalanceInfo> {
    return getChainPoolService(this.api, this.solParams, provider).getUserBalanceInfo(accountAddress, token);
  }

  /**
   * Gets information about the poolInfo from chain
   * @param token
   * @param provider
   * @returns poolInfo
   */
  async getPoolInfo(token: TokenWithChainDetails, provider?: Provider): Promise<Required<PoolInfo>> {
    const pool = await getChainPoolService(this.api, this.solParams, provider).getPoolInfoFromChain(token);
    const imbalance = calculatePoolInfoImbalance(pool);
    return { ...pool, imbalance };
  }
}

export function getChainPoolService(
  api: AllbridgeCoreClient,
  solParams: SolanaPoolParams,
  provider?: Provider
): ChainPoolService {
  if (!provider) {
    return new SolanaPoolService(solParams, api);
  }
  if (isTronWeb(provider)) {
    return new TronPoolService(provider, api);
  } else {
    // Web3
    return new EvmPoolService(provider as unknown as Web3, api);
  }
}

function isTronWeb(params: Provider): boolean {
  // @ts-expect-error get existing trx property
  return (params as TronWeb).trx !== undefined;
}
