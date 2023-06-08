import { AllbridgeCoreClient } from "../../client/core-api";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, LiquidityPoolsParams, LiquidityPoolsParamsWithAmount } from "./models";
import { SolanaPoolParams } from "./sol";
import { getChainPoolService, LiquidityPoolService } from "./index";

export class RawTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaPoolParams,
    private liquidityPoolService: LiquidityPoolService,
    private tokenService: TokenService
  ) {}

  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction> {
    return this.tokenService.buildRawTransactionApprove(provider, {
      ...approveData,
      spender: approveData.token.poolAddress,
    });
  }
  /**
   * Creates a Raw Transaction for depositing tokens to Liquidity pools
   * @param params
   * @param provider
   */
  async deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    return getChainPoolService(this.api, this.solParams, provider).buildRawTransactionDeposit(params);
  }

  /**
   * Creates a Raw Transaction for withdrawing tokens from Liquidity pools
   * @param params
   * @param provider
   */
  async withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toString();
    return getChainPoolService(this.api, this.solParams, provider).buildRawTransactionWithdraw(params);
  }

  /**
   * Creates a Raw Transaction for claiming rewards from Liquidity pools
   * @param params
   * @param provider
   */
  async claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return getChainPoolService(this.api, this.solParams, provider).buildRawTransactionClaimRewards(params);
  }
}
