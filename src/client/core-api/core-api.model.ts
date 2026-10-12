import { ChainSymbol } from "../../chains/chain.enums";
import { PoolInfo, SuiAddresses } from "../../tokens-info";

export type ChainDetailsResponse = Record<string, ChainDetailsDTO>;

export interface AbrPayerChainInfoDTO {
  payerAddress: string;
  tokenAddress: string;
  tokenDecimals: number;
  payerAvailability: AbrPayerAvailabilityTypeDTO;
}

export interface ChainDetailsDTO {
  tokens: TokenDTO[];
  chainId: number;
  bridgeId?: string;
  paddingUtilId?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  bridgeAddress?: string;
  oftBridgeAddress?: string;
  abrPayer?: AbrPayerChainInfoDTO;
  /** @deprecated Do not use. Not served by the current Core API. */
  swapAddress?: string;
  /**
   * @deprecated Do not use.
   */
  yieldAddress?: string;
  transferTime: TransferTimeDTO;
  txCostAmount: TxCostAmountDTO;
  confirmations: number;
  suiAddresses?: SuiAddresses;
}

export enum AddressStatus {
  OK = "OK",
  INVALID = "INVALID",
  FORBIDDEN = "FORBIDDEN",
  UNINITIALIZED = "UNINITIALIZED",
  CONTRACT_ADDRESS = "CONTRACT_ADDRESS",
  WRONG_ASSOCIATED_ACCOUNT_OWNER = "WRONG_ASSOCIATED_ACCOUNT_OWNER",
}

export interface TokenDTO {
  symbol: string;
  name: string;
  decimals: number;
  /** @deprecated Do not use. Not served by the current Core API. */
  poolAddress?: string;
  tokenAddress: string;
  originTokenAddress?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  poolInfo?: PoolInfoDTO;
  oftId?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  feeShare?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  apr?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  apr7d?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  apr30d?: string;
  /** @deprecated Do not use. Not served by the current Core API. */
  lpRate?: string;
  cctpAddress?: string;
  cctpV2Address?: string;
  cctpFeeShare?: string;
  cctpV2FeeShare?: string;
  /**
   * @deprecated Do not use.
   */
  yieldId?: number;
  xReserve?: XReserveDTO;
  /**
   * NEAR Intents (1Click) asset of the token. Defined when the token is listed by NEAR Intents.
   */
  nearIntents?: NearIntentsDTO;
  /**
   * True when the token is the native gas token of the chain (listed under a sentinel address).
   */
  isNative?: boolean;
  /**
   * Optional: the current Core API always returns all tokens and omits the flags,
   * in which case every token is treated as `swap: true, pool: false`.
   */
  flags?: {
    swap: boolean;
    /** @deprecated Do not use. */
    pool: boolean;
  };
}

export interface XReserveDTO {
  bridgeAddress: string;
  feeConst: string;
  feeShare: string;
  protocolAddress?: string;
}

export interface NearIntentsDTO {
  assetId: string;
}

/**
 * @deprecated Do not use.
 */
export interface PoolInfoDTO {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
  p: number;
}

export enum MessengerKeyDTO {
  /** @deprecated Do not use. */
  ALLBRIDGE = "allbridge",
  /** @deprecated Do not use. */
  WORMHOLE = "wormhole",
  CCTP = "cctp",
  CCTP_V2 = "cctpV2",
  OFT = "oft",
  X_RESERVE = "xReserve",
  NEAR_INTENTS = "nearIntents",
}

export type AbrPayerAvailabilityKeyDTO = (typeof MessengerKeyDTO)[keyof typeof MessengerKeyDTO];

export type AbrPayerAvailabilityTypeDTO = Partial<Record<AbrPayerAvailabilityKeyDTO, boolean>>;

export type TransferTimeDTO = Record<string, MessengerTransferTimeDTO>;

export interface TxCostAmountDTO {
  maxAmount: string;
  swap: string;
  transfer: string;
}

export type MessengerTransferTimeDTO = {
  [messenger in MessengerKeyDTO]: number | null;
};

/**
 * Bridging protocol used for a transfer.
 * Only {@link ActiveMessenger} values are supported.
 */
export enum Messenger {
  /** @deprecated Do not use. */
  ALLBRIDGE = 1,
  /** @deprecated Do not use. */
  WORMHOLE = 2,
  /**
   * Circle CCTP.
   * Route is supported when `cctpAddress` is defined on both source and destination tokens.
   */
  CCTP = 3,
  /**
   * Circle CCTP V2.
   * Route is supported when `cctpV2Address` is defined on both source and destination tokens.
   */
  CCTP_V2 = 4,
  /**
   * LayerZero OFT.
   * Route is supported when source and destination tokens have the same `oftId`
   * and `oftBridgeAddress` is defined on both chains.
   */
  OFT = 5,
  /**
   * xReserve.
   * Route is supported when `xReserve` is defined on both source and destination tokens.
   */
  X_RESERVE = 6,
  /**
   * NEAR Intents (1Click).
   * Route is supported when `nearIntents` is defined on both source and destination tokens.
   * The transfer is a plain token (or native currency) transfer to a one-shot deposit address,
   * so no approval is needed. Amounts are market-priced quotes from the Core API, not a deterministic fee:
   * see `AllbridgeCoreSdk.nearIntents`.
   */
  NEAR_INTENTS = 7,
}

/**
 * @deprecated Do not use.
 */
export type LegacyMessenger = Messenger.ALLBRIDGE | Messenger.WORMHOLE;
/**
 * Messengers supported for transfers: {@link Messenger.CCTP}, {@link Messenger.CCTP_V2}, {@link Messenger.OFT}, {@link Messenger.X_RESERVE}, {@link Messenger.NEAR_INTENTS}
 */
export type ActiveMessenger = Exclude<Messenger, LegacyMessenger>;

export interface ReceiveTransactionCostRequest {
  sourceChainId: number;
  destinationChainId: number;
  messenger: Messenger;
  sourceToken?: string;
}

export interface ReceiveTransactionCostResponse {
  exchangeRate: string;
  fee: string;
  sourceNativeTokenPrice: string;
  abrExchangeRate?: string;
  adminFeeShareWithExtras?: string;
}

/**
 * NEAR Intents quote direction.
 * - `EXACT_INPUT`: `amount` is what the user sends.
 * - `EXACT_OUTPUT`: `amount` is what the user wants to receive.
 */
export type NearIntentsSwapType = "EXACT_INPUT" | "EXACT_OUTPUT";

export interface NearIntentsQuoteRequest {
  sourceChainId: number;
  sourceToken: string;
  destinationChainId: number;
  destinationToken: string;
  /**
   * Integer amount: in source token units for `EXACT_INPUT`, in destination token units for `EXACT_OUTPUT`.
   */
  amount: string;
  swapType: NearIntentsSwapType;
}

export interface NearIntentsQuoteResponse {
  /** Integer amount in source token units */
  amountIn: string;
  /** Integer amount in destination token units */
  amountOut: string;
  /** Integer amount in destination token units, the slippage floor */
  minAmountOut: string;
  /** Estimated transfer time, seconds */
  timeEstimate: number;
  /**
   * True when the server answered from its per-route quote model instead of a live 1Click quote.
   * Deposits are never estimated. Older servers omit it.
   */
  estimated: boolean;
  /** Absent on an estimated answer for a token without a catalog price */
  amountInUsd?: string;
  /** Absent on an estimated answer for a token without a catalog price */
  amountOutUsd?: string;
}

export interface NearIntentsDepositRequest extends NearIntentsQuoteRequest {
  recipient: string;
  refundTo: string;
}

export interface NearIntentsDepositResponse {
  depositAddress: string;
  depositMemo?: string;
  /** Integer amount in source token units */
  amountIn: string;
  /** Integer amount in destination token units */
  amountOut: string;
  /** Integer amount in destination token units, the slippage floor */
  minAmountOut: string;
  /** ISO 8601 */
  deadline: string;
  /** ISO 8601 */
  timeWhenInactive?: string;
  /** Estimated transfer time, seconds */
  timeEstimate: number;
}

export interface NearIntentsSubmitDepositRequest {
  depositAddress: string;
  depositMemo?: string;
  txId: string;
}

/**
 * Error codes of the Core API NEAR Intents endpoints (HTTP 400 and 502 bodies).
 */
export type NearIntentsErrorCode = "AMOUNT_TOO_LOW" | "NO_LIQUIDITY" | "FAILED_TO_GET_QUOTE" | "UPSTREAM_ERROR";

export interface NearIntentsErrorResponse {
  code: NearIntentsErrorCode;
  message: string;
  minAmount?: string;
  minAmountUsd?: string;
}

export interface GasBalanceResponse {
  gasBalance: string | null;
  status: AddressStatus;
}

export interface CheckAddressResponse {
  gasBalance: string | null;
  status: AddressStatus;
}

export interface TransferStatusResponse {
  txId: string;

  sourceChainSymbol: ChainSymbol;
  destinationChainSymbol: ChainSymbol;

  sendAmount: string;
  sendAmountFormatted: number;

  stableFee: string;
  stableFeeFormatted: number;

  sourceTokenAddress: string;
  destinationTokenAddress: string;

  originSourceTokenAddress?: string;
  originDestinationTokenAddress?: string;

  senderAddress: string;
  recipientAddress: string;

  signaturesCount: number;
  signaturesNeeded: number;

  send: BridgeTransaction;
  receive?: BridgeTransaction;

  /**
   * True when the transfer was refunded to the sender on the source chain instead of being delivered
   * (e.g. a {@link Messenger.NEAR_INTENTS} deposit refunded by NEAR Intents); `receive` stays absent.
   * Optional: older Core API versions may omit it.
   */
  refunded?: boolean;

  /**
   * Hash of the refund transaction on the source chain, when {@link refunded} and the refund tx is known
   * ({@link Messenger.NEAR_INTENTS} only). `null` until the Core API has indexed it, which can be a poll
   * later than `refunded`. Optional: older Core API versions omit it.
   */
  refundTxId?: string | null;

  /**
   * Amount returned to the sender, in the smallest units of the source token (like {@link sendAmount}),
   * when {@link refunded} ({@link Messenger.NEAR_INTENTS} only). It is the deposited amount minus the refund fee,
   * so it can differ from the quoted amount after an incomplete deposit. `null` until known.
   * Optional: older Core API versions omit it.
   */
  refundedAmount?: string | null;

  /**
   * {@link refundedAmount} in source token units (like {@link sendAmountFormatted}). `null` until known.
   * Optional: older Core API versions omit it.
   */
  refundedAmountFormatted?: number | null;

  responseTime?: number;
}

export interface BridgeTransaction {
  txId: string;

  sourceChainId: number;
  destinationChainId: number;

  fee: string;
  feeFormatted: number;

  stableFee: string;
  stableFeeFormatted: number;

  amount: string;
  amountFormatted: number;
  virtualAmount: string;

  bridgeContract: string;
  sender: string;
  recipient: string;

  sourceTokenAddress: string;
  destinationTokenAddress: string;

  originSourceTokenAddress?: string;
  originDestinationTokenAddress?: string;

  hash: string;

  messenger: Messenger;

  blockTime: number;
  blockId: string;

  confirmations: number;
  confirmationsNeeded: number;

  isClaimable?: boolean;
}

/**
 * @deprecated Do not use.
 */
export type PoolInfoResponse = Record<string, PoolInfo>;
/**
 * @deprecated Do not use.
 */
export type PendingInfoResponse = Partial<Record<string, TokenPendingInfoDTO>>;
/**
 * @deprecated Do not use.
 */
export type TokenPendingInfoDTO = Record<string, PendingInfoDTO>;

/**
 * @deprecated Do not use.
 */
export interface PendingInfoDTO {
  pendingTxs: number;
  totalSentAmount: string;
}
