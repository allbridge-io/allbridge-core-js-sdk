export {
  ApproveData,
  TransactionResponse,
  BaseSendParams,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenAddress,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
} from "../services/bridge/models/bridge.model";
export { Messenger, TransferStatusResponse, BridgeTransaction } from "../client/core-api/core-api.model";
export { ChainSymbol, ChainType } from "../chains/index";
export {
  TokenInfoWithChainDetails,
  TransferTime,
  MessengerTransferTime,
  PoolInfo,
} from "../tokens-info/tokens-info.model";
export { RawTransactionBuilder } from "../raw-transaction-builder";
export {
  UserBalanceInfo,
  UserBalanceInfoDTO,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
} from "../services/liquidity-pool/models/pool.model";

export interface AmountsAndTxCost {
  /**
   * The amount of tokens to be sent.
   */
  amountToSendFloat: string;

  /**
   * The amount of tokens to be received.
   */
  amountToBeReceivedFloat: string;

  /**
   * The amount of gas fee to pay for the transfer in the smallest denomination of the source chain currency.
   */
  txCost: string;
}

export enum FeePaymentMethod {
  /**
   * The fee is paid in the native currency of the source chain.
   */
  WITH_NATIVE_CURRENCY = "native",

  /**
   * The fee is paid with the stablecoin token.
   */
  WITH_STABLECOIN = "stablecoin",
}

export interface AmountsAndGasFeeOptions {
  /**
   * The floating point amount of tokens to be sent (not including gas fee).
   */
  amountToSendFloat: string;

  /**
   * The floating point amount of tokens to be received.
   */
  amountToBeReceivedFloat: string;

  /**
   * Available ways to pay the transfer gas fee and gas fee amount.
   */
  gasFeeOptions: GasFeeOptions;
}

/**
 * Describes available options of paying the gas fee and the amount to pay when using the corresponding method.
 *
 * For {@link FeePaymentMethod.WITH_NATIVE_CURRENCY} value contains the amount in the smallest denomination of the source chain currency
 *
 * For {@link FeePaymentMethod.WITH_STABLECOIN} value contains the amount in the smallest denomination of the source token
 */
export type GasFeeOptions = {
  [key in FeePaymentMethod]?: string;
};
