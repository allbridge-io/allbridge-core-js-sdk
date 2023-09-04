import { Big } from "big.js";
import { AllbridgeCoreClient } from "../../client/core-api";
import { validateAmountDecimals } from "../../utils";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, LiquidityPoolsParams, LiquidityPoolsParamsWithAmount } from "./models";
import { SolanaPoolParams } from "./sol";
import { getChainPoolService, LiquidityPoolService } from "./index";

export interface RawPoolTransactionBuilder {
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for depositing tokens to Liquidity pools
   * @param params
   * @param provider
   */
  deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for withdrawing tokens from Liquidity pools
   * @param params
   * @param provider
   */
  withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for claiming rewards from Liquidity pools
   * @param params
   * @param provider
   */
  claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawPoolTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaPoolParams,
    private tronRpcUrl: string,
    private liquidityPoolService: LiquidityPoolService,
    private tokenService: TokenService
  ) {}

  async approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction> {
    return this.tokenService.buildRawTransactionApprove(provider, {
      ...approveData,
      spender: approveData.token.poolAddress,
    });
  }

  async deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    return getChainPoolService(
      params.token.chainType,
      this.api,
      this.solParams,
      this.tronRpcUrl,
      provider
    ).buildRawTransactionDeposit(params);
  }

  async withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    return getChainPoolService(
      params.token.chainType,
      this.api,
      this.solParams,
      this.tronRpcUrl,
      provider
    ).buildRawTransactionWithdraw(params);
  }

  async claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return getChainPoolService(
      params.token.chainType,
      this.api,
      this.solParams,
      this.tronRpcUrl,
      provider
    ).buildRawTransactionClaimRewards(params);
  }
}
