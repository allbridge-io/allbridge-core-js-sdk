import { LifiIntentsSwapType } from "../../client/core-api/core-api.model";
import { TokenWithChainDetails } from "../../tokens-info";
import { RawTransaction } from "../models";

/**
 * Params of a LI.FI Intents quote, see `lifiIntents.getQuote`
 */
export interface LifiIntentsQuoteParams {
  /**
   * The float amount:
   * the amount to send (in source token units, the Allbridge fee included) for `EXACT_INPUT`,
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
  swapType?: LifiIntentsSwapType;
}

/**
 * A LI.FI Intents quote. Amounts are float strings.
 */
export interface LifiIntentsQuote {
  /**
   * The float amount to send, in source token units, the Allbridge fee included
   */
  amountIn: string;
  /**
   * The float amount to receive, in destination token units
   */
  amountOut: string;
  /**
   * The Allbridge fee, float in source token units; a part of {@link amountIn}, kept by the `LifiIntentsBridge` contract
   * and not refunded
   */
  fee: string;
  /**
   * Estimated transfer time, seconds
   */
  timeEstimate: number;
}

/**
 * Params of a LI.FI Intents order, see `lifiIntents.createOrder`
 */
export interface LifiIntentsCreateOrderParams extends LifiIntentsQuoteParams {
  /**
   * The account address the transfer is sent from: it signs the order transaction and gets the refund of an unfilled order.
   * On Solana: the wallet pubkey, which also pays the transaction fee.
   */
  fromAccountAddress: string;
  /**
   * The account address on the destination chain to receive the tokens.
   * On Solana: the wallet (owner) pubkey; the solver pays its associated token account.
   */
  toAccountAddress: string;
}

/**
 * The allowance a LI.FI Intents order needs before its transaction is sent (EVM only)
 */
export interface LifiIntentsApproval {
  /**
   * The source token address
   */
  token: string;
  /**
   * The `LifiIntentsBridge` contract to approve
   */
  spender: string;
  /**
   * The float amount to approve, in source token units (`amountIn`)
   */
  amount: string;
}

/**
 * The ready-to-sign transaction of a LI.FI Intents order, as served by the Core API
 */
export interface LifiIntentsOrderTransaction {
  /**
   * EVM: the `LifiIntentsBridge` contract address (the transaction `to`). Solana: the `lifi-intents-bridge` program id
   */
  contractAddress: string;
  /**
   * Integer native value to attach: `amountIn` in the smallest units for a native source token, `"0"` otherwise
   * (always `"0"` on Solana)
   */
  value: string;
  /**
   * EVM: 0x-prefixed calldata of the `bridge` / `bridgeNative` call.
   * Solana: base64 of the unsigned v0 `VersionedTransaction` (fee payer = sender, a fresh blockhash: sign at once)
   */
  data: string;
}

/**
 * A LI.FI Intents order: a live quote with the transaction that opens it. Amounts are float strings.
 * The order is short-lived, see {@link validUntil} and {@link fillDeadline}: create it right before signing.
 */
export interface LifiIntentsOrder {
  /**
   * The escrow order id (bytes32 hex): the transfer id shown by the explorer and `getTransferStatus`
   */
  orderId: string;
  /**
   * The address the order was created for; it must sign the transaction
   */
  sender: string;
  /**
   * The recipient on the destination chain the order was created for
   */
  recipient: string;
  /**
   * The float amount to send, in source token units, the Allbridge fee included
   */
  amountIn: string;
  /**
   * The float amount to receive, in destination token units
   */
  amountOut: string;
  /**
   * The Allbridge fee, float in source token units; a part of {@link amountIn}
   */
  fee: string;
  /**
   * Estimated transfer time, seconds
   */
  timeEstimate: number;
  /**
   * The LI.FI quote validity (40-120 s after the order creation): the exclusive solver fills the order only for about
   * 90 s, so sign the transaction at once
   */
  validUntil: Date;
  /**
   * The transaction reverts after this time (about 10 min after the order creation): create a new order then
   */
  fillDeadline: Date;
  /**
   * The allowance the sender must have given before sending the transaction.
   * Optional: absent for a native source token and for a Solana source
   */
  approval?: LifiIntentsApproval;
  /**
   * The transaction to sign and send, see {@link LifiIntentsOrderTransaction}
   */
  transaction: LifiIntentsOrderTransaction;
}

/**
 * Params of `lifiIntents.buildSendTransaction`
 */
export interface LifiIntentsSendParams {
  /**
   * The float amount of tokens to send, the Allbridge fee included
   */
  amount: string;
  /**
   * The account address to transfer tokens from; it signs the transaction and gets refunds.
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
   * An order created with `lifiIntents.createOrder`. Optional.
   * If not defined, a new order is created for {@link amount} (`EXACT_INPUT`).
   * When defined, its `amountIn`, `sender` and `recipient` must match {@link amount}, {@link fromAccountAddress}
   * and {@link toAccountAddress}.
   */
  lifiIntentsOrder?: LifiIntentsOrder;
}

/**
 * Result of `lifiIntents.buildSendTransaction`
 */
export interface LifiIntentsSendTransaction {
  /**
   * The transaction to be signed and sent by `order.sender` before `order.fillDeadline`:
   * the `LifiIntentsBridge` call (`RawEvmTransaction`) on EVM, an unsigned `VersionedTransaction`
   * (`RawBridgeSolanaTransaction`) on Solana
   */
  rawTransaction: RawTransaction;
  /**
   * The order the transaction opens
   */
  order: LifiIntentsOrder;
}
