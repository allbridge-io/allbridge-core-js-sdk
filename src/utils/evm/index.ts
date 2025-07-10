import { ApiClientImpl } from "../../client/core-api/api-client";
import { ApiClientCaching } from "../../client/core-api/api-client-caching";
import { AllbridgeCoreClientImpl } from "../../client/core-api/core-client-base";
import {
  AllbridgeCoreClientFiltered,
  AllbridgeCoreClientFilteredImpl,
} from "../../client/core-api/core-client-filtered";
import { AllbridgeCoreClientPoolInfoCaching } from "../../client/core-api/core-client-pool-info-caching";
import { AllbridgeCoreSdkOptions, Provider, RawTransaction } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { DefaultTokenService, TokenService } from "../../services/token";
import { ApproveParams, CheckAllowanceParams, GetAllowanceParams } from "../../services/token/models";

/**
 * Contains usefully EVM methods
 */
export interface EvmUtils {
  /**
   * Get amount of tokens approved to be sent by the bridge
   * @param params - See {@link GetAllowanceParams}
   * @param provider - optional, will be used to access the network
   * @returns the amount of approved tokens
   */
  getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param params - See {@link CheckAllowanceParams}
   * @param provider - optional, will be used to access the network
   * @return true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean>;

  /**
   * builds a raw transaction for approving token usage by the specified spender
   * @param approveData - data for approval
   * @param provider - optional, will be used to access the network
   *
   * @return a raw transaction for approving token usage
   */
  buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultEvmUtils implements EvmUtils {
  private readonly api: AllbridgeCoreClientFiltered;
  private readonly tokenService: TokenService;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {
    const apiClient = new ApiClientImpl(params);
    const apiClientCaching = new ApiClientCaching(apiClient);
    const coreClient = new AllbridgeCoreClientImpl(apiClientCaching);
    const coreClientPoolInfoCaching = new AllbridgeCoreClientPoolInfoCaching(coreClient);
    this.api = new AllbridgeCoreClientFilteredImpl(coreClientPoolInfoCaching, params);
    this.tokenService = new DefaultTokenService(this.api, nodeRpcUrlsConfig, params);
  }

  buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction> {
    return this.tokenService.buildRawTransactionApprove(approveData, provider);
  }

  checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean> {
    return this.tokenService.checkAllowance(params, provider);
  }

  getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string> {
    return this.tokenService.getAllowance(params, provider);
  }
}
