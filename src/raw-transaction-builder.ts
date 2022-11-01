import { BridgeService } from "./bridge";
import {
  ApproveData,
  Provider,
  RawTransaction,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
} from "./bridge/models";

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
  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<RawTransaction> {
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
  ): Promise<RawTransaction> {
    return this.bridgeService.buildRawTransactionSend(provider, params);
  }
}
