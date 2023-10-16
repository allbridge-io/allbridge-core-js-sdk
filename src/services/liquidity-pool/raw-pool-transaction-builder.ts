import { AllbridgeCoreClient } from "../../client/core-api";
import { NodeRpcUrlsConfig } from "../../index";
import { validateAmountDecimals } from "../../utils";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, LiquidityPoolsParams, LiquidityPoolsParamsWithAmount } from "./models";
import { getChainPoolService } from "./index";

export interface RawPoolTransactionBuilder {
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider - will be used to access the network
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction>;
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param approveData
   */
  approve(approveData: ApproveParams): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for depositing tokens to Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   */
  deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for withdrawing tokens from Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   */
  withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for claiming rewards from Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   */
  claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawPoolTransactionBuilder implements RawPoolTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private tokenService: TokenService
  ) {}

  async approve(a: Provider | ApproveParams, b?: ApproveParams): Promise<RawTransaction> {
    if (b) {
      const provider = a as Provider;
      const approveData: ApproveParams = b;
      return this.tokenService.buildRawTransactionApprove(
        {
          ...approveData,
          spender: approveData.token.poolAddress,
        },
        provider
      );
    } else {
      const approveData: ApproveParams = a as ApproveParams;
      return this.tokenService.buildRawTransactionApprove({
        ...approveData,
        spender: approveData.token.poolAddress,
      });
    }
  }

  async deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      provider
    ).buildRawTransactionDeposit(params);
  }

  async withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      provider
    ).buildRawTransactionWithdraw(params);
  }

  async claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      provider
    ).buildRawTransactionClaimRewards(params);
  }
}
