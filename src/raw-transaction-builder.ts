import { BridgeService } from "./bridge";
import {
  ApproveData,
  Provider,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
} from "./bridge/models";
import { TokenInfo, TokensInfo } from "./tokens-info";

export * from "./configs/production";
export * from "./models";
export {
  TokenInfo,
  TokensInfo,
  ChainDetailsMap,
  ChainDetailsWithTokens,
} from "./tokens-info";

export interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class RawTransactionBuilder {
  /**
   * @internal
   */
  private bridgeService: BridgeService;

  /**
   *
   * @param bridgeService
   */
  constructor(bridgeService: BridgeService) {
    this.bridgeService = bridgeService;
  }

  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveData): Promise<Object> {
    return this.bridgeService.buildRawTransactionApprove(provider, approveData);
  }

  /**
   * Creates a Raw Transaction for initiating the transfer of tokens
   * @param provider
   * @param params
   */
  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<Object> {
    return this.bridgeService.buildRawTransactionSend(provider, params);
  }
}
