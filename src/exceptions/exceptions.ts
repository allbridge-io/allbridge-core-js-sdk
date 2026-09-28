export abstract class SdkRootError extends Error {
  public errorCode: ErrorCode;

  protected constructor(code: ErrorCode, message?: string) {
    super(message);
    this.errorCode = code;
  }
}

export class SdkError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.SDK_ERROR, message);
  }
}

export class InvalidAmountError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INVALID_AMOUNT_ERROR, message);
  }
}

export class AmountNotEnoughError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.AMOUNT_NOT_ENOUGH_ERROR, message);
  }
}

/**
 * @deprecated Do not use.
 */
export class InsufficientPoolLiquidityError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INSUFFICIENT_POOL_LIQUIDITY_ERROR, message);
  }
}

export class JupiterError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.JUPITER_ERROR, message);
  }
}

export class InvalidGasFeePaymentOptionError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INVALID_GAS_FEE_PAYMENT_OPTION_ERROR, message);
  }
}

export class InvalidMessengerOptionError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INVALID_MESSENGER_OPTION_ERROR, message);
  }
}

export class MethodNotSupportedError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.METHOD_NOT_SUPPORTED_ERROR, message);
  }
}

export class VerifyTxError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.VERIFY_TX_ERROR, message);
  }
}

export class InvalidTxError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INVALID_TX_ERROR, message);
  }
}

export class ExtraGasMaxLimitExceededError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.EXTRA_GAS_MAX_LIMIT_EXCEEDED_ERROR, message);
  }
}

export class ArgumentInvalidDecimalsError extends SdkRootError {
  constructor(argName: string, decimalsIs: number, decimalsRequired: number) {
    super(
      ErrorCode.ARGUMENT_INVALID_DECIMALS_ERROR,
      `Argument '${argName}' decimals '${decimalsIs}' cannot be greater than '${decimalsRequired}'`
    );
  }
}

export class TimeoutError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.TIMEOUT_ERROR, message);
  }
}

export class NodeRpcUrlNotInitializedError extends SdkRootError {
  constructor(chainSymbol: string) {
    super(ErrorCode.NODE_RPC_URL_NOT_INITIALIZED_ERROR, `For chain '${chainSymbol}' Node RPC URL not initialized`);
  }
}

export class CCTPDoesNotSupportedError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.CCTP_DOES_NOT_SUPPORTED_ERROR, message);
  }
}

export class OFTDoesNotSupportedError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.OFT_DOES_NOT_SUPPORTED_ERROR, message);
  }
}

/**
 * The route is not supported by `Messenger.NEAR_INTENTS`: `nearIntents` is missing on the source or destination token,
 * or the Core API does not know the route.
 */
export class NearIntentsDoesNotSupportedError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.NEAR_INTENTS_DOES_NOT_SUPPORTED_ERROR, message);
  }
}

/**
 * The NEAR Intents amount is below the route minimum.
 */
export class NearIntentsAmountTooLowError extends SdkRootError {
  /**
   * Minimum amount, integer in the source token units. Optional.
   */
  public minAmount?: string;
  /**
   * Minimum amount in USD. Optional.
   */
  public minAmountUsd?: string;

  constructor(message?: string, minAmount?: string, minAmountUsd?: string) {
    super(ErrorCode.NEAR_INTENTS_AMOUNT_TOO_LOW_ERROR, message);
    this.minAmount = minAmount;
    this.minAmountUsd = minAmountUsd;
  }
}

/**
 * NEAR Intents has no liquidity for the route right now.
 */
export class NearIntentsNoLiquidityError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.NEAR_INTENTS_NO_LIQUIDITY_ERROR, message);
  }
}

/**
 * NEAR Intents failed to produce a quote or deposit (`FAILED_TO_GET_QUOTE`, or an upstream error).
 */
export class NearIntentsQuoteError extends SdkRootError {
  /**
   * Core API error code, e.g. `FAILED_TO_GET_QUOTE` or `UPSTREAM_ERROR`. Optional.
   */
  public code?: string;

  constructor(message?: string, code?: string) {
    super(ErrorCode.NEAR_INTENTS_QUOTE_ERROR, message);
    this.code = code;
  }
}

/**
 * @deprecated Do not use.
 */
export class YieldDoesNotSupportedError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.YIELD_DOES_NOT_SUPPORTED_ERROR, message);
  }
}

export class TxTooLargeError extends SdkRootError {
  constructor() {
    super(
      ErrorCode.TX_TOO_LARGE,
      "Transaction too large: try again later or switch to another messenger or pay relayer fee in native gas currency"
    );
  }
}

export enum ErrorCode {
  SDK_ERROR = "SdkError",
  INVALID_AMOUNT_ERROR = "InvalidAmountError",
  AMOUNT_NOT_ENOUGH_ERROR = "AmountNotEnoughError",
  /** @deprecated Do not use. */
  INSUFFICIENT_POOL_LIQUIDITY_ERROR = "InsufficientPoolLiquidityError",
  JUPITER_ERROR = "JupiterError",
  INVALID_GAS_FEE_PAYMENT_OPTION_ERROR = "InvalidGasFeePaymentOptionError",
  INVALID_MESSENGER_OPTION_ERROR = "InvalidMessengerOptionError",
  METHOD_NOT_SUPPORTED_ERROR = "MethodNotSupportedError",
  VERIFY_TX_ERROR = "VerifyTxError",
  INVALID_TX_ERROR = "InvalidTxError",
  EXTRA_GAS_MAX_LIMIT_EXCEEDED_ERROR = "ExtraGasMaxLimitExceededError",
  ARGUMENT_INVALID_DECIMALS_ERROR = "ArgumentInvalidDecimalsError",
  TIMEOUT_ERROR = "TimeoutError",
  NODE_RPC_URL_NOT_INITIALIZED_ERROR = "NodeRpcUrlNotInitializedError",
  CCTP_DOES_NOT_SUPPORTED_ERROR = "CCTPDoesNotSupportedError",
  OFT_DOES_NOT_SUPPORTED_ERROR = "OFTDoesNotSupportedError",
  NEAR_INTENTS_DOES_NOT_SUPPORTED_ERROR = "NearIntentsDoesNotSupportedError",
  NEAR_INTENTS_AMOUNT_TOO_LOW_ERROR = "NearIntentsAmountTooLowError",
  NEAR_INTENTS_NO_LIQUIDITY_ERROR = "NearIntentsNoLiquidityError",
  NEAR_INTENTS_QUOTE_ERROR = "NearIntentsQuoteError",
  /**
   * @deprecated Do not use.
   */
  YIELD_DOES_NOT_SUPPORTED_ERROR = "YieldDoesNotSupportedError",
  TX_TOO_LARGE = "TxTooLargeError",
}
