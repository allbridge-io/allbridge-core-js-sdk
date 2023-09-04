import { Big } from "big.js";
import { AllbridgeCoreClient } from "../../client/core-api";
import { validateAmountDecimals } from "../../utils";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, SendParams, SwapParams } from "./models";
import { SolanaBridgeParams } from "./sol";
import { isSendParams } from "./utils";
import { BridgeService, getChainBridgeService } from "./index";

export interface RawBridgeTransactionBuilder {
  /**
   * Creates a Raw Transaction for approving tokens usage by the bridge
   * @param provider
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction>;

  /**
   * Creates a Raw Transaction for initiating the transfer of tokens
   * @param provider
   * @param params
   */
  send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawBridgeTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaBridgeParams,
    private bridgeService: BridgeService,
    private tokenService: TokenService
  ) {}

  async approve(provider: Provider, approveData: ApproveParams): Promise<RawTransaction> {
    return this.tokenService.buildRawTransactionApprove(provider, {
      ...approveData,
      spender: approveData.token.bridgeAddress,
    });
  }

  async send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.sourceToken.decimals);
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
