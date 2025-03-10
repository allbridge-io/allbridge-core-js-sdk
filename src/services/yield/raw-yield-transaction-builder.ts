import { NodeRpcUrlsConfig } from "..";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions } from "../../index";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { YieldApproveParams, YieldDepositParams, YieldWithdrawParams } from "./models/yield.model";
import { getChainYieldService } from "./index";

export interface RawYieldTransactionBuilder {
  /**
   * Creates a Raw Transaction for approving tokens usage by the Yield
   * @param approveData
   * @param provider - will be used to access the network
   */
  approve(approveData: YieldApproveParams, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for depositing tokens to Yield
   * @param params
   * @param provider - will be used to access the network
   */
  deposit(params: YieldDepositParams, provider?: Provider): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for withdrawing tokens from Yield
   * @param params
   * @param provider - will be used to access the network
   */
  withdraw(params: YieldWithdrawParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawYieldTransactionBuilder implements RawYieldTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private params: AllbridgeCoreSdkOptions,
    private tokenService: TokenService
  ) {}

  async approve(approveData: YieldApproveParams, provider?: Provider): Promise<RawTransaction> {
    return this.tokenService.buildRawTransactionApprove(
      {
        ...approveData,
        spender: approveData.token.yieldAddress,
      },
      provider
    );
  }

  async deposit(params: YieldDepositParams, provider?: Provider): Promise<RawTransaction> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    validateAmountGtZero(params.minVirtualAmount);
    validateAmountDecimals("minVirtualAmount", params.minVirtualAmount, 3);
    params.amount = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    params.minVirtualAmount = convertFloatAmountToInt(params.minVirtualAmount, 3).toFixed();
    return getChainYieldService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      params.owner,
      provider
    ).buildRawTransactionDeposit(params);
  }

  async withdraw(params: YieldWithdrawParams, provider?: Provider): Promise<RawTransaction> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, SYSTEM_PRECISION);
    params.amount = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    return getChainYieldService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      params.owner,
      provider
    ).buildRawTransactionWithdraw(params);
  }
}
