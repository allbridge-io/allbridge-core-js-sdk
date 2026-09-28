/* eslint-disable @typescript-eslint/unified-signatures -- overloads intentionally expose operation-specific deprecation metadata */
import { NodeRpcUrlsConfig } from "..";
import { Messenger } from "../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions } from "../../index";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { Provider, RawTransaction } from "../models";
import { DefaultNearIntentsService, NearIntentsService } from "../near-intents";
import { assertNearIntentsSendParams } from "../near-intents/utils";
import { TokenService } from "../token";
import { ApproveParams, SendParams, SwapParams } from "./models";
import { resolveSpender } from "./spender";
import { isSendParams } from "./utils";
import { getChainBridgeService } from "./index";

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
   *
   * For {@link Messenger.NEAR_INTENTS}: the transaction is a plain transfer of the source tokens to a NEAR Intents deposit address.
   * {@link SendParams.nearIntentsDeposit} is used when defined, otherwise a new deposit is created
   * (to get the deposit details as well, use `nearIntents.buildSendTransaction`).
   * `extraGas` and a non-zero `fee` are rejected. Only EVM source chains are supported for now.
   * @param params
   * @param provider - will be used to access the network
   */
  send(params: SendParams, provider?: Provider): Promise<RawTransaction>;
  /** @deprecated Do not use. */
  send(params: SwapParams, provider?: Provider): Promise<RawTransaction>;
  send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction>;
}

export class DefaultRawBridgeTransactionBuilder implements RawBridgeTransactionBuilder {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private params: AllbridgeCoreSdkOptions,
    private tokenService: TokenService,
    private nearIntentsService: NearIntentsService = new DefaultNearIntentsService(api, nodeRpcUrlsConfig, params)
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
    const spender = resolveSpender(approveData.token, approveData.messenger, approveData.gasFeePaymentMethod);
    return this.tokenService.buildRawTransactionApprove(
      {
        ...approveData,
        spender,
      },
      provider
    );
  }

  send(params: SendParams, provider?: Provider): Promise<RawTransaction>;
  /** @deprecated Do not use. */
  send(params: SwapParams, provider?: Provider): Promise<RawTransaction>;
  send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction>;
  async send(params: SwapParams | SendParams, provider?: Provider): Promise<RawTransaction> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.sourceToken.decimals);
    if (isSendParams(params)) {
      if (params.messenger === Messenger.NEAR_INTENTS) {
        assertNearIntentsSendParams(params);
        const { rawTransaction } = await this.nearIntentsService.buildSendTransaction(params, provider);
        return rawTransaction;
      }
      return getChainBridgeService(
        params.sourceToken.chainSymbol,
        this.api,
        this.nodeRpcUrlsConfig,
        this.params,
        provider
      ).buildRawTransactionSend(params);
    }
    return getChainBridgeService(
      params.sourceToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).buildRawTransactionSwap(params);
  }
}
