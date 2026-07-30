import { NodeRpcUrlsConfig } from "..";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions } from "../../index";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, LiquidityPoolsParams, LiquidityPoolsParamsWithAmount } from "./models";
import { getChainPoolService } from "./index";

/**
 * @deprecated Do not use.
 */
export interface RawPoolTransactionBuilder {
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider - will be used to access the network
   * @param approveData
   * @deprecated Do not use.
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction>;
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param approveData
   * @deprecated Do not use.
   */
  approve(approveData: ApproveParams): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for depositing tokens to Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   * @deprecated Do not use.
   */
  deposit(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for withdrawing tokens from Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   * @deprecated Do not use.
   */
  withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for claiming rewards from Liquidity pools
   * @param params
   * @param provider - will be used to access the network
   * @deprecated Do not use.
   */
  claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction>;
}

/**
 * @deprecated Do not use.
 */
export class DefaultRawPoolTransactionBuilder implements RawPoolTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private params: AllbridgeCoreSdkOptions,
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
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).buildRawTransactionDeposit(params);
  }

  async withdraw(params: LiquidityPoolsParamsWithAmount, provider?: Provider): Promise<RawTransaction> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).buildRawTransactionWithdraw(params);
  }

  async claimRewards(params: LiquidityPoolsParams, provider?: Provider): Promise<RawTransaction> {
    return getChainPoolService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).buildRawTransactionClaimRewards(params);
  }
}
