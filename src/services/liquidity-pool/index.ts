import { Big } from "big.js";
import Web3 from "web3";
import { ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";
import { validateAmountDecimals } from "../../utils";
import { convertIntAmountToFloat, fromSystemPrecision } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { depositAmountToVUsd, vUsdToWithdrawalAmount } from "../utils/calculation";
import { EvmPoolService } from "./evm";
import { ApproveParams, CheckAllowanceParams, GetAllowanceParams, ChainPoolService, UserBalanceInfo } from "./models";
import { DefaultRawPoolTransactionBuilder, RawPoolTransactionBuilder } from "./raw-pool-transaction-builder";
import { SolanaPoolService, SolanaPoolParams } from "./sol";
import { TronPoolService } from "./trx";

export interface LiquidityPoolService {
  rawTxBuilder: RawPoolTransactionBuilder;

  /**
   * Get amount of tokens approved for poolInfo
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  /**
   * Calculates the amount of LP tokens that will be deposited
   * @param amount The float amount of tokens that will be sent
   * @param token
   * @param provider
   * @returns amount
   */
  getAmountToBeDeposited(amount: string, token: TokenWithChainDetails, provider?: Provider): Promise<string>;

  /**
   * Calculates the amount of tokens will be withdrawn
   * @param amount The float amount of tokens that will be sent
   * @param accountAddress
   * @param token
   * @param provider
   * @returns amount
   */
  getAmountToBeWithdrawn(
    amount: string,
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<string>;

  /**
   * Get User Balance Info on Liquidity poolInfo
   * @param accountAddress
   * @param token
   * @param provider
   * @returns UserBalanceInfo
   */
  getUserBalanceInfo(
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<UserBalanceInfo>;

  /**
   * Gets information about the poolInfo from chain
   * @param token
   * @param provider
   * @returns poolInfo
   */
  getPoolInfoFromChain(token: TokenWithChainDetails, provider?: Provider): Promise<Required<PoolInfo>>;
}

export class DefaultLiquidityPoolService implements LiquidityPoolService {
  public rawTxBuilder: RawPoolTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaPoolParams,
    private tokenService: TokenService,
    private tronRpcUrl: string
  ) {
    this.rawTxBuilder = new DefaultRawPoolTransactionBuilder(api, solParams, tronRpcUrl, this, tokenService);
  }

  async getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string> {
    return await this.tokenService.getAllowance(provider, {
      ...params,
      spender: params.token.poolAddress,
    });
  }

  async checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean> {
    return this.tokenService.checkAllowance(provider, { ...params, spender: params.token.poolAddress });
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.tokenService.approve(provider, { ...approveData, spender: approveData.token.poolAddress });
  }

  async getAmountToBeDeposited(amount: string, token: TokenWithChainDetails, provider?: Provider): Promise<string> {
    validateAmountDecimals("amount", Big(amount).toString(), token.decimals);
    const pool = await this.getPoolInfoFromChain(token, provider);
    const { vUsdBalance, tokenBalance, aValue, dValue } = pool;
    const vUsd = depositAmountToVUsd(amount, aValue, dValue, tokenBalance, vUsdBalance);
    return convertIntAmountToFloat(vUsd, SYSTEM_PRECISION).toFixed();
  }

  async getAmountToBeWithdrawn(
    amount: string,
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<string> {
    validateAmountDecimals("amount", Big(amount).toString(), token.decimals);
    const pool = await this.getPoolInfoFromChain(token, provider);
    const tokenAmountInSP = vUsdToWithdrawalAmount(amount);
    const tokenAmount = fromSystemPrecision(tokenAmountInSP, token.decimals);
    const userBalanceInfo = await this.getUserBalanceInfo(accountAddress, token, provider);
    const earned = userBalanceInfo.earned(pool) || "0";
    const commonAmount = Big(tokenAmount).plus(earned).toFixed();
    return convertIntAmountToFloat(commonAmount, token.decimals).toFixed();
  }

  async getUserBalanceInfo(
    accountAddress: string,
    token: TokenWithChainDetails,
    provider?: Provider
  ): Promise<UserBalanceInfo> {
    return getChainPoolService(token.chainType, this.api, this.solParams, this.tronRpcUrl, provider).getUserBalanceInfo(
      accountAddress,
      token
    );
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails, provider?: Provider): Promise<PoolInfo> {
    return await getChainPoolService(
      token.chainType,
      this.api,
      this.solParams,
      this.tronRpcUrl,
      provider
    ).getPoolInfoFromChain(token);
  }
}

export function getChainPoolService(
  chainType: ChainType,
  api: AllbridgeCoreClient,
  solParams: SolanaPoolParams,
  tronRpcUrl: string,
  provider?: Provider
): ChainPoolService {
  switch (chainType) {
    case ChainType.EVM:
      return new EvmPoolService(provider as unknown as Web3, api);
    case ChainType.TRX:
      return new TronPoolService(provider, api, tronRpcUrl);
    case ChainType.SOLANA:
      return new SolanaPoolService(solParams, api);
  }
}
