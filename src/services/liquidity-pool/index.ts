import { Big } from "big.js";
// @ts-expect-error import tron
import TronWeb from "tronweb";
import Web3 from "web3";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { MethodNotSupportedError, NodeRpcUrlsConfig } from "../../index";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";
import { validateAmountDecimals } from "../../utils";
import { convertIntAmountToFloat, fromSystemPrecision } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { depositAmountToVUsd, vUsdToWithdrawalAmount } from "../utils/calculation";
import { EvmPoolService } from "./evm";
import { ApproveParams, ChainPoolService, CheckAllowanceParams, GetAllowanceParams, UserBalanceInfo } from "./models";
import { DefaultRawPoolTransactionBuilder, RawPoolTransactionBuilder } from "./raw-pool-transaction-builder";
import { SolanaPoolService } from "./sol";
import { TronPoolService } from "./trx";

export interface LiquidityPoolService {
  rawTxBuilder: RawPoolTransactionBuilder;

  /**
   * Get amount of tokens approved for poolInfo
   * @param provider - will be used to access the network
   * @param params See {@link GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string>;

  /**
   * Get amount of tokens approved for poolInfo
   * @param params See {@link GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(params: GetAllowanceParams): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough
   * @param provider - will be used to access the network
   * @param params See {@link CheckAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Check if the amount of approved tokens is enough
   * @param params See {@link CheckAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider - will be used to access the network
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  /**
   * Calculates the amount of LP tokens that will be deposited
   * @param amount The float amount of tokens that will be sent
   * @param token
   * @param provider - will be used to access the network
   * @returns amount
   */
  getAmountToBeDeposited(amount: string, token: TokenWithChainDetails, provider?: Provider): Promise<string>;

  /**
   * Calculates the amount of tokens will be withdrawn
   * @param amount The float amount of tokens that will be sent
   * @param accountAddress
   * @param token
   * @param provider - will be used to access the network
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
   * @param provider - will be used to access the network
   * @returns poolInfo
   */
  getPoolInfoFromChain(token: TokenWithChainDetails, provider?: Provider): Promise<Required<PoolInfo>>;
}

export class DefaultLiquidityPoolService implements LiquidityPoolService {
  public rawTxBuilder: RawPoolTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new DefaultRawPoolTransactionBuilder(api, nodeRpcUrlsConfig, tokenService);
  }

  async getAllowance(a: Provider | GetAllowanceParams, b?: GetAllowanceParams): Promise<string> {
    if (b) {
      const provider = a as Provider;
      const params = b;
      return await this.tokenService.getAllowance({ ...params, spender: params.token.poolAddress }, provider);
    } else {
      const params = a as GetAllowanceParams;
      return await this.tokenService.getAllowance({ ...params, spender: params.token.poolAddress });
    }
  }

  async checkAllowance(a: Provider | CheckAllowanceParams, b?: CheckAllowanceParams): Promise<boolean> {
    if (b) {
      const provider = a as Provider;
      const params = b;
      return this.tokenService.checkAllowance({ ...params, spender: params.token.poolAddress }, provider);
    } else {
      const params = a as CheckAllowanceParams;
      return this.tokenService.checkAllowance({ ...params, spender: params.token.poolAddress });
    }
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
    return getChainPoolService(token.chainSymbol, this.api, this.nodeRpcUrlsConfig, provider).getUserBalanceInfo(
      accountAddress,
      token
    );
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails, provider?: Provider): Promise<PoolInfo> {
    return await getChainPoolService(
      token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      provider
    ).getPoolInfoFromChain(token);
  }
}

export function getChainPoolService(
  chainSymbol: ChainSymbol,
  api: AllbridgeCoreClient,
  nodeRpcUrlsConfig: NodeRpcUrlsConfig,
  provider?: Provider
): ChainPoolService {
  switch (chainProperties[chainSymbol].chainType) {
    case ChainType.EVM: {
      if (provider) {
        return new EvmPoolService(provider as unknown as Web3, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new EvmPoolService(new Web3(nodeRpcUrl), api);
      }
    }
    case ChainType.TRX: {
      const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
      if (provider) {
        return new TronPoolService(provider, api, nodeRpcUrl);
      } else {
        return new TronPoolService(new TronWeb({ fullHost: nodeRpcUrl }), api, nodeRpcUrl);
      }
    }
    case ChainType.SOLANA: {
      const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
      return new SolanaPoolService(nodeRpcUrl, api);
    }
    case ChainType.SRB: {
      throw new MethodNotSupportedError("Soroban does not support yet");
    }
  }
}
