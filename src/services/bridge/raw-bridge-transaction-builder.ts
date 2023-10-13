import { AllbridgeCoreClient } from "../../client/core-api";
import { NodeRpcUrlsConfig } from "../../index";
import { validateAmountDecimals } from "../../utils";
import { Provider, RawTransaction } from "../models";
import { TokenService } from "../token";
import { ApproveParams, SendParams, SwapParams } from "./models";
import { SolanaBridgeParams } from "./sol";
import { isSendParams } from "./utils";
import { getChainBridgeService, getSpender } from "./index";

export interface RawBridgeTransactionBuilder {
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
   * Creates a Raw Transaction for initiating the transfer of tokens
   * @param params
   * @param provider - will be used to access the network
   */
  send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawBridgeTransactionBuilder implements RawBridgeTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private solParams: SolanaBridgeParams,
    private tokenService: TokenService
  ) {}

  async approve(a: Provider | ApproveParams, b?: ApproveParams): Promise<RawTransaction> {
    let provider: Provider | undefined;
    let approveData: ApproveParams;
    if (b) {
      provider = a as Provider;
      approveData = b;
    } else {
      approveData = a as ApproveParams;
    }
    const spender = getSpender(approveData.token, approveData.messenger);
    return this.tokenService.buildRawTransactionApprove(
      {
        ...approveData,
        spender,
      },
      provider
    );
  }

  async send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction> {
    validateAmountDecimals("amount", params.amount, params.sourceToken.decimals);
    if (isSendParams(params)) {
      return getChainBridgeService(
        params.sourceToken.chainSymbol,
        this.api,
        this.nodeRpcUrlsConfig,
        this.solParams,
        provider
      ).buildRawTransactionSend(params);
    }
    return getChainBridgeService(
      params.sourceToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.solParams,
      provider
    ).buildRawTransactionSwap(params);
  }
}
