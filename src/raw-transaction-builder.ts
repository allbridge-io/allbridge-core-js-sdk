import { BridgeService } from "./services/bridge";
import { ApproveDataWithTokenInfo, SendParamsWithTokenInfos } from "./services/bridge/models";
import { LiquidityPoolService } from "./services/liquidity-pool";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount } from "./services/liquidity-pool/models";
import { Provider, RawTransaction } from "./services/models";

export class RawTransactionBuilder {
  /**
   * @internal
   */
  private bridgeService: BridgeService;
  private liquidityPoolService: LiquidityPoolService;

  /**
   *
   * @param bridgeService
   */
  constructor(bridgeService: BridgeService, liquidityPoolService: LiquidityPoolService) {
    this.bridgeService = bridgeService;
    this.liquidityPoolService = liquidityPoolService;
  }

  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveDataWithTokenInfo): Promise<RawTransaction> {
    return this.bridgeService.buildRawTransactionApprove(provider, approveData);
  }

  /**
   * Creates a Raw Transaction for initiating the transfer of tokens
   * @param provider
   * @param params
   */
  async send(params: SendParamsWithTokenInfos, provider?: Provider): Promise<RawTransaction> {
    return this.bridgeService.buildRawTransactionSend(params, provider);
  }

  /**
   * Creates a Raw Transaction for depositing tokens to Liquidity pools
   * @param params
   * @param provider
   */
  async deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    return this.liquidityPoolService.buildRawTransactionDeposit(params, provider);
  }

  /**
   * Creates a Raw Transaction for withdrawing tokens from Liquidity pools
   * @param params
   * @param provider
   */
  async withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    return this.liquidityPoolService.buildRawTransactionWithdraw(params, provider);
  }

  /**
   * Creates a Raw Transaction for claiming rewards from Liquidity pools
   * @param params
   * @param provider
   */
  async claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return this.liquidityPoolService.buildRawTransactionClaimRewards(params, provider);
  }
}
