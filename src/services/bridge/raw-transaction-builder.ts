import { AllbridgeCoreClient } from "../../client/core-api";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, SendParams, SwapParams } from "./models";
import { SolanaBridgeParams } from "./sol";
import { isSendParams } from "./utils";
import { BridgeService, getChainBridgeService } from "./index";

export class RawTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaBridgeParams,
    private bridgeService: BridgeService,
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
      spender: approveData.token.bridgeAddress,
    });
  }

  /**
   * Creates a Raw Transaction for initiating the transfer of tokens
   * @param provider
   * @param params
   */
  async send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction> {
    if (isSendParams(params)) {
      return getChainBridgeService(
        params.sourceToken.chainType,
        this.api,
        this.solParams,
        provider
      ).buildRawTransactionSend(params);
    }
    return getChainBridgeService(
      params.sourceToken.chainType,
      this.api,
      this.solParams,
      provider
    ).buildRawTransactionSwap(params);
  }
}
