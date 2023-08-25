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

export class AmountNotEnoughError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.AMOUNT_NOT_ENOUGH_ERROR, message);
  }
}

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

export enum ErrorCode {
  SDK_ERROR = "SdkError",
  AMOUNT_NOT_ENOUGH_ERROR = "AmountNotEnoughError",
  INSUFFICIENT_POOL_LIQUIDITY_ERROR = "InsufficientPoolLiquidityError",
  JUPITER_ERROR = "JupiterError",
  INVALID_GAS_FEE_PAYMENT_OPTION_ERROR = "InvalidGasFeePaymentOptionError",
  METHOD_NOT_SUPPORTED_ERROR = "MethodNotSupportedError",
  VERIFY_TX_ERROR = "VerifyTxError",
  INVALID_TX_ERROR = "InvalidTxError",
  EXTRA_GAS_MAX_LIMIT_EXCEEDED_ERROR = "ExtraGasMaxLimitExceededError",
}
