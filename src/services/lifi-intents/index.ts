import { VersionedTransaction } from "@solana/web3.js";
import { Big } from "big.js";
import { ChainType } from "../../chains/chain.enums";
import {
  LifiIntentsOrderResponse,
  LifiIntentsQuoteRequest,
  LifiIntentsSwapType,
} from "../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { SdkError } from "../../exceptions";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { RawBridgeSolanaTransaction, RawEvmTransaction, RawTransaction } from "../models";
import {
  LifiIntentsCreateOrderParams,
  LifiIntentsOrder,
  LifiIntentsQuote,
  LifiIntentsQuoteParams,
  LifiIntentsSendParams,
  LifiIntentsSendTransaction,
} from "./models";
import { assertLifiIntentsRoute } from "./utils";

/**
 * LI.FI Intents (`Messenger.LIFI_INTENTS`) quotes and orders.
 *
 * Send flow (EVM and Solana source chains):
 * 1. {@link getQuote} (or `getAmountToBeReceived` / `getAmountToSend` with `Messenger.LIFI_INTENTS`)
 *    to show the expected amounts, the Allbridge fee and the ETA.
 * 2. EVM: `bridge.checkAllowance` / `bridge.rawTxBuilder.approve` with `Messenger.LIFI_INTENTS`: the spender is
 *    `sourceToken.lifiIntents.bridgeAddress`. A native source token and a Solana source need no approval.
 *    Approve before creating the order: the order is short-lived.
 * 3. {@link buildSendTransaction} (or `bridge.rawTxBuilder.send` with `Messenger.LIFI_INTENTS`):
 *    creates the order and returns the transaction to sign: the `LifiIntentsBridge` call on EVM,
 *    a `VersionedTransaction` of the `lifi-intents-bridge` program on Solana (the sender is the fee payer).
 * 4. Sign and send the transaction at once (see {@link LifiIntentsOrder.validUntil}), before `order.fillDeadline`
 *    (a Solana transaction also carries a fresh blockhash, valid for about a minute).
 * 5. `getTransferStatus(sourceChainSymbol, txId)` once the Core API has indexed the transfer.
 */
export interface LifiIntentsService {
  /**
   * Fetches a LI.FI Intents quote.
   * @param params See {@link LifiIntentsQuoteParams}
   * @returns {@link LifiIntentsQuote} with float amounts
   * @throws LifiIntentsDoesNotSupportedError if the route is not supported,
   * LifiIntentsAmountTooLowError, LifiIntentsAmountTooHighError, LifiIntentsNoQuoteError or LifiIntentsQuoteError
   * if no quote is available
   */
  getQuote(params: LifiIntentsQuoteParams): Promise<LifiIntentsQuote>;

  /**
   * Creates a LI.FI Intents order: a live quote with the ready-to-sign `LifiIntentsBridge` transaction.
   * The order is short-lived: create it right before signing, after the allowance is in place.
   * @param params See {@link LifiIntentsCreateOrderParams}
   * @returns {@link LifiIntentsOrder} with float amounts
   * @throws the same errors as {@link getQuote}
   */
  createOrder(params: LifiIntentsCreateOrderParams): Promise<LifiIntentsOrder>;

  /**
   * Builds the transaction of a LI.FI Intents transfer:
   * uses `params.lifiIntentsOrder` or creates a new order (`EXACT_INPUT`),
   * then returns its transaction: the `LifiIntentsBridge` call as a raw EVM transaction,
   * or the unsigned `VersionedTransaction` of the Solana program ({@link RawBridgeSolanaTransaction}).
   * @param params See {@link LifiIntentsSendParams}
   * @returns {@link LifiIntentsSendTransaction}
   */
  buildSendTransaction(params: LifiIntentsSendParams): Promise<LifiIntentsSendTransaction>;
}

export class DefaultLifiIntentsService implements LifiIntentsService {
  constructor(private api: AllbridgeCoreClient) {}

  async getQuote(params: LifiIntentsQuoteParams): Promise<LifiIntentsQuote> {
    const request = prepareQuoteRequest(params);
    const quote = await this.api.getLifiIntentsQuote(request);
    return {
      amountIn: convertIntAmountToFloat(quote.amountIn, params.sourceToken.decimals).toFixed(),
      amountOut: convertIntAmountToFloat(quote.amountOut, params.destinationToken.decimals).toFixed(),
      fee: convertIntAmountToFloat(quote.fee, params.sourceToken.decimals).toFixed(),
      timeEstimate: quote.timeEstimate,
    };
  }

  async createOrder(params: LifiIntentsCreateOrderParams): Promise<LifiIntentsOrder> {
    const request = prepareQuoteRequest(params);
    const order = await this.api.createLifiIntentsOrder({
      ...request,
      sender: params.fromAccountAddress,
      recipient: params.toAccountAddress,
      app: "core",
    });
    return mapOrder(order, params);
  }

  async buildSendTransaction(params: LifiIntentsSendParams): Promise<LifiIntentsSendTransaction> {
    const { sourceToken, destinationToken, fromAccountAddress, toAccountAddress } = params;
    assertLifiIntentsRoute(sourceToken, destinationToken);
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, sourceToken.decimals);
    const amountInt = convertFloatAmountToInt(params.amount, sourceToken.decimals);

    let order: LifiIntentsOrder;
    if (params.lifiIntentsOrder) {
      order = params.lifiIntentsOrder;
      if (!convertFloatAmountToInt(order.amountIn, sourceToken.decimals).eq(amountInt)) {
        throw new SdkError(
          `LI.FI Intents order amountIn ${order.amountIn} does not match the amount to send ${Big(params.amount).toFixed()}`
        );
      }
      if (!sameAddress(order.sender, fromAccountAddress) || !sameAddress(order.recipient, toAccountAddress)) {
        throw new SdkError("LI.FI Intents order was created for another sender or recipient, create a new order");
      }
    } else {
      order = await this.createOrder({
        amount: params.amount,
        sourceToken,
        destinationToken,
        fromAccountAddress,
        toAccountAddress,
        swapType: "EXACT_INPUT",
      });
    }
    if (order.fillDeadline.getTime() <= Date.now()) {
      throw new SdkError("LI.FI Intents order fill deadline has passed, create a new order");
    }

    return { rawTransaction: toRawTransaction(order, sourceToken.chainType, fromAccountAddress), order };
  }
}

function toRawTransaction(order: LifiIntentsOrder, chainType: ChainType, from: string): RawTransaction {
  if (chainType === ChainType.SOLANA) {
    try {
      const transaction: RawBridgeSolanaTransaction = VersionedTransaction.deserialize(
        Buffer.from(order.transaction.data, "base64")
      );
      return transaction;
    } catch (e) {
      throw new SdkError(`LI.FI Intents order transaction is not a Solana transaction: ${(e as Error).message}`);
    }
  }
  const transaction: RawEvmTransaction = {
    from,
    to: order.transaction.contractAddress,
    value: order.transaction.value,
    data: order.transaction.data,
  };
  return transaction;
}

function sameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function prepareQuoteRequest(params: LifiIntentsQuoteParams): LifiIntentsQuoteRequest {
  const { sourceToken, destinationToken } = params;
  const swapType: LifiIntentsSwapType = params.swapType ?? "EXACT_INPUT";
  assertLifiIntentsRoute(sourceToken, destinationToken);
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

function mapOrder(order: LifiIntentsOrderResponse, params: LifiIntentsCreateOrderParams): LifiIntentsOrder {
  const { sourceToken, destinationToken } = params;
  return {
    orderId: order.orderId,
    sender: params.fromAccountAddress,
    recipient: params.toAccountAddress,
    amountIn: convertIntAmountToFloat(order.amountIn, sourceToken.decimals).toFixed(),
    amountOut: convertIntAmountToFloat(order.amountOut, destinationToken.decimals).toFixed(),
    fee: convertIntAmountToFloat(order.fee, sourceToken.decimals).toFixed(),
    timeEstimate: order.timeEstimate,
    validUntil: new Date(order.validUntil * 1000),
    fillDeadline: new Date(order.fillDeadline * 1000),
    approval: order.approval
      ? {
          token: order.approval.token,
          spender: order.approval.spender,
          amount: convertIntAmountToFloat(order.approval.amount, sourceToken.decimals).toFixed(),
        }
      : undefined,
    transaction: {
      contractAddress: order.tx.contractAddress,
      value: order.tx.value,
      data: order.tx.tx,
    },
  };
}
