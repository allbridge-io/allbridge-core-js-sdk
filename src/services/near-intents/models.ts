import { NearIntentsSwapType } from "../../client/core-api/core-api.model";
import { TokenWithChainDetails } from "../../tokens-info";
import { RawTransaction } from "../models";

/**
 * Params of a NEAR Intents quote, see `nearIntents.getQuote`
 */
export interface NearIntentsQuoteParams {
  /**
   * The float amount:
   * the amount to send (in source token units) for `EXACT_INPUT`,
   * the amount to receive (in destination token units) for `EXACT_OUTPUT`.
   */
  amount: string;
  /**
   * {@link TokenWithChainDetails |The token info object} on the source chain.
   */
  sourceToken: TokenWithChainDetails;
  /**
   * {@link TokenWithChainDetails |The token info object} on the destination chain.
   */
  destinationToken: TokenWithChainDetails;
  /**
   * Optional. `EXACT_INPUT` by default.
   */
  swapType?: NearIntentsSwapType;
}

/**
 * A NEAR Intents quote. Amounts are float strings.
 */
export interface NearIntentsQuote {
  /**
   * The float amount to send, in source token units
   */
  amountIn: string;
  /**
   * The expected float amount to receive, in destination token units
   */
  amountOut: string;
  /**
   * The minimum float amount to receive after slippage, in destination token units
   */
  minAmountOut: string;
  /**
   * Estimated transfer time, seconds
   */
  timeEstimate: number;
  /**
   * True when the server computed the amounts from its per-route model of recent NEAR Intents quotes
   * instead of requesting a live quote for this exact amount (keeps repeated quotes fast, e.g. while
   * the user types). An estimated quote is fine for display, but the real amounts may differ slightly.
   * `nearIntents.createDeposit` and `buildSendTransaction` always get a live quote, so the amounts
   * they return are the binding ones.
   */
  estimated: boolean;
  /**
   * USD value of {@link amountIn}; absent on an estimated quote for a token without a known price
   */
  amountInUsd?: string;
  /**
   * USD value of {@link amountOut}; absent on an estimated quote for a token without a known price
   */
  amountOutUsd?: string;
}

/**
 * Params of a NEAR Intents deposit, see `nearIntents.createDeposit`
 */
export interface NearIntentsCreateDepositParams extends NearIntentsQuoteParams {
  /**
   * The account address the transfer is sent from; refunds go back to it.
   */
  fromAccountAddress: string;
  /**
   * The account address on the destination chain to receive the tokens.
   */
  toAccountAddress: string;
}

/**
 * A NEAR Intents deposit: the one-shot address the source tokens must be sent to before {@link deadline}.
 * Amounts are float strings.
 */
export interface NearIntentsDeposit {
  /**
   * The address to send {@link amountIn} of the source token to
   */
  depositAddress: string;
  /**
   * The memo the deposit transfer must carry. Optional, defined for chains that need it (e.g. Stellar)
   */
  depositMemo?: string;
  /**
   * The float amount to send, in source token units
   */
  amountIn: string;
  /**
   * The expected float amount to receive, in destination token units
   */
  amountOut: string;
  /**
   * The minimum float amount to receive after slippage, in destination token units
   */
  minAmountOut: string;
  /**
   * The deposit must be sent before this time; funds arriving later may be lost
   */
  deadline: Date;
  /**
   * The time after which the deposit address becomes inactive. Optional
   */
  timeWhenInactive?: Date;
  /**
   * Estimated transfer time, seconds
   */
  timeEstimate: number;
}

/**
 * Params of `nearIntents.submitDeposit`
 */
export interface NearIntentsSubmitDepositParams {
  depositAddress: string;
  depositMemo?: string;
  /**
   * The hash of the deposit transaction on the source chain
   */
  txId: string;
}

/**
 * Params of `nearIntents.buildSendTransaction`
 */
export interface NearIntentsSendParams {
  /**
   * The float amount of tokens to send
   */
  amount: string;
  /**
   * The account address to transfer tokens from; refunds go back to it.
   */
  fromAccountAddress: string;
  /**
   * The account address on the destination chain to receive the tokens.
   */
  toAccountAddress: string;
  /**
   * {@link TokenWithChainDetails |The token info object} on the source chain.
   */
  sourceToken: TokenWithChainDetails;
  /**
   * {@link TokenWithChainDetails |The token info object} on the destination chain.
   */
  destinationToken: TokenWithChainDetails;
  /**
   * A deposit created with `nearIntents.createDeposit`. Optional.
   * If not defined, a new deposit is created for {@link amount} (`EXACT_INPUT`).
   * When defined, its `amountIn` must equal {@link amount}.
   */
  nearIntentsDeposit?: NearIntentsDeposit;
}

/**
 * Result of `nearIntents.buildSendTransaction`
 */
export interface NearIntentsSendTransaction {
  /**
   * The transfer of the source tokens to the deposit address, to be signed and sent before `deposit.deadline`
   */
  rawTransaction: RawTransaction;
  /**
   * The deposit the transaction pays into
   */
  deposit: NearIntentsDeposit;
}
