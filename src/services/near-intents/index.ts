import { Big } from "big.js";
import {
  NearIntentsDepositResponse,
  NearIntentsQuoteRequest,
  NearIntentsSwapType,
} from "../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { SdkError } from "../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../index";
import { TokenWithChainDetails } from "../../tokens-info";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { getChainBridgeService } from "../bridge";
import { NodeRpcUrlsConfig } from "../index";
import { Provider } from "../models";
import {
  NearIntentsCreateDepositParams,
  NearIntentsDeposit,
  NearIntentsQuote,
  NearIntentsQuoteParams,
  NearIntentsSendParams,
  NearIntentsSendTransaction,
  NearIntentsSubmitDepositParams,
} from "./models";
import { assertNearIntentsRoute } from "./utils";

/**
 * NEAR Intents (`Messenger.NEAR_INTENTS`) quotes and deposits.
 *
 * Send flow:
 * 1. {@link getQuote} (or `getAmountToBeReceived` / `getAmountToSend` with `Messenger.NEAR_INTENTS`)
 *    to show the expected amounts, `minAmountOut` and the ETA.
 * 2. {@link buildSendTransaction} (or `bridge.rawTxBuilder.send` with `Messenger.NEAR_INTENTS`):
 *    creates a deposit and builds a plain transfer of the source tokens to its deposit address.
 * 3. Sign and send the transaction before `deposit.deadline`.
 * 4. Optionally {@link submitDeposit} with the transaction hash to speed up the processing.
 *
 * No approval is needed. Only EVM source chains are supported for now.
 */
export interface NearIntentsService {
  /**
   * Fetches a NEAR Intents quote.
   * @param params See {@link NearIntentsQuoteParams}
   * @returns {@link NearIntentsQuote} with float amounts
   * @throws NearIntentsDoesNotSupportedError if the route is not supported,
   * NearIntentsAmountTooLowError, NearIntentsNoLiquidityError or NearIntentsQuoteError if no quote is available
   */
  getQuote(params: NearIntentsQuoteParams): Promise<NearIntentsQuote>;

  /**
   * Creates a NEAR Intents deposit: a quote with a one-shot deposit address.
   * The deposit must be funded before its `deadline`.
   * @param params See {@link NearIntentsCreateDepositParams}
   * @returns {@link NearIntentsDeposit} with float amounts
   * @throws the same errors as {@link getQuote}
   */
  createDeposit(params: NearIntentsCreateDepositParams): Promise<NearIntentsDeposit>;

  /**
   * Notifies NEAR Intents about the deposit transaction to speed up its detection.
   * Optional: errors are logged and never thrown.
   * @param params See {@link NearIntentsSubmitDepositParams}
   */
  submitDeposit(params: NearIntentsSubmitDepositParams): Promise<void>;

  /**
   * Builds the deposit transaction of a NEAR Intents transfer:
   * uses `params.nearIntentsDeposit` or creates a new deposit (`EXACT_INPUT`),
   * then a plain transfer of its `amountIn` to its deposit address
   * (a native currency transfer when the source token {@link TokenWithChainDetails.isNative | isNative}).
   * @param params See {@link NearIntentsSendParams}
   * @param provider - will be used to access the network. Optional
   * @returns {@link NearIntentsSendTransaction}
   */
  buildSendTransaction(params: NearIntentsSendParams, provider?: Provider): Promise<NearIntentsSendTransaction>;
}

export class DefaultNearIntentsService implements NearIntentsService {
  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private params: AllbridgeCoreSdkOptions
  ) {}

  async getQuote(params: NearIntentsQuoteParams): Promise<NearIntentsQuote> {
    const request = prepareQuoteRequest(params);
    const quote = await this.api.getNearIntentsQuote(request);
    return {
      amountIn: convertIntAmountToFloat(quote.amountIn, params.sourceToken.decimals).toFixed(),
      amountOut: convertIntAmountToFloat(quote.amountOut, params.destinationToken.decimals).toFixed(),
      minAmountOut: convertIntAmountToFloat(quote.minAmountOut, params.destinationToken.decimals).toFixed(),
      timeEstimate: quote.timeEstimate,
      amountInUsd: quote.amountInUsd,
      amountOutUsd: quote.amountOutUsd,
    };
  }

  async createDeposit(params: NearIntentsCreateDepositParams): Promise<NearIntentsDeposit> {
    const request = prepareQuoteRequest(params);
    const deposit = await this.api.createNearIntentsDeposit({
      ...request,
      recipient: params.toAccountAddress,
      refundTo: params.fromAccountAddress,
    });
    return mapDeposit(deposit, params.sourceToken, params.destinationToken);
  }

  async submitDeposit(params: NearIntentsSubmitDepositParams): Promise<void> {
    try {
      await this.api.submitNearIntentsDeposit({
        depositAddress: params.depositAddress,
        depositMemo: params.depositMemo,
        txId: params.txId,
      });
    } catch (e) {
      console.warn(`NEAR Intents deposit submit failed for ${params.depositAddress}`, e);
    }
  }

  async buildSendTransaction(params: NearIntentsSendParams, provider?: Provider): Promise<NearIntentsSendTransaction> {
    const { sourceToken, destinationToken } = params;
    assertNearIntentsRoute(sourceToken, destinationToken);
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, sourceToken.decimals);
    const amountInt = convertFloatAmountToInt(params.amount, sourceToken.decimals);

    let deposit: NearIntentsDeposit;
    if (params.nearIntentsDeposit) {
      deposit = params.nearIntentsDeposit;
      if (!convertFloatAmountToInt(deposit.amountIn, sourceToken.decimals).eq(amountInt)) {
        throw new SdkError(
          `NEAR Intents deposit amountIn ${deposit.amountIn} does not match the amount to send ${Big(params.amount).toFixed()}`
        );
      }
    } else {
      deposit = await this.createDeposit({
        amount: params.amount,
        sourceToken,
        destinationToken,
        fromAccountAddress: params.fromAccountAddress,
        toAccountAddress: params.toAccountAddress,
        swapType: "EXACT_INPUT",
      });
    }
    if (deposit.deadline.getTime() <= Date.now()) {
      throw new SdkError("NEAR Intents deposit deadline has passed, create a new deposit");
    }

    const rawTransaction = await getChainBridgeService(
      sourceToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).buildRawTransactionTransfer({
      amount: convertFloatAmountToInt(deposit.amountIn, sourceToken.decimals).toFixed(0),
      token: sourceToken,
      fromAccountAddress: params.fromAccountAddress,
      toAddress: deposit.depositAddress,
      memo: deposit.depositMemo,
    });
    return { rawTransaction, deposit };
  }
}

function prepareQuoteRequest(params: NearIntentsQuoteParams): NearIntentsQuoteRequest {
  const { sourceToken, destinationToken } = params;
  const swapType: NearIntentsSwapType = params.swapType ?? "EXACT_INPUT";
  assertNearIntentsRoute(sourceToken, destinationToken);
  validateAmountGtZero(params.amount);
  const amountDecimals = swapType === "EXACT_INPUT" ? sourceToken.decimals : destinationToken.decimals;
  validateAmountDecimals("amount", params.amount, amountDecimals);
  return {
    sourceChainId: sourceToken.allbridgeChainId,
    sourceToken: sourceToken.tokenAddress,
    destinationChainId: destinationToken.allbridgeChainId,
    destinationToken: destinationToken.tokenAddress,
    amount: convertFloatAmountToInt(params.amount, amountDecimals).toFixed(0),
    swapType,
  };
}

function mapDeposit(
  deposit: NearIntentsDepositResponse,
  sourceToken: TokenWithChainDetails,
  destinationToken: TokenWithChainDetails
): NearIntentsDeposit {
  return {
    depositAddress: deposit.depositAddress,
    depositMemo: deposit.depositMemo,
    amountIn: convertIntAmountToFloat(deposit.amountIn, sourceToken.decimals).toFixed(),
    amountOut: convertIntAmountToFloat(deposit.amountOut, destinationToken.decimals).toFixed(),
    minAmountOut: convertIntAmountToFloat(deposit.minAmountOut, destinationToken.decimals).toFixed(),
    deadline: new Date(deposit.deadline),
    timeWhenInactive: deposit.timeWhenInactive ? new Date(deposit.timeWhenInactive) : undefined,
    timeEstimate: deposit.timeEstimate,
  };
}
