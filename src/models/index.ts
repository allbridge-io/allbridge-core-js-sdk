export {
  ApproveParams,
  BaseSendParams,
  CheckAllowanceParams,
  GetAllowanceParams,
  GetTokenBalanceParams,
  SendParams,
} from "../services/bridge/models/bridge.model";
export { BridgeService } from "../services/bridge/index";
export { LiquidityPoolService } from "../services/liquidity-pool/index";
export { TransactionResponse } from "../services/models/index";
export { Messenger, TransferStatusResponse, BridgeTransaction } from "../client/core-api/core-api.model";
export { ChainSymbol, ChainType } from "../chains/index";
export {
  PoolInfo,
  TokenWithChainDetails,
  TransferTime,
  TxCostAmount,
  MessengerTransferTime,
} from "../tokens-info/tokens-info.model";
export {
  UserBalanceInfo,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
} from "../services/liquidity-pool/models/pool.model";
export { Provider, RawTransaction } from "../services/models/index";

export { testnet, testnetNodeUrlsDefault } from "../configs/testnet";

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

/**
 * Define the type of amount data<p/>
 * Example:<p/>
 *  "1500000" USDC {@link AmountFormat.INT} = "1.5" USDC {@link AmountFormat.FLOAT}, if USDC.decimals = 6
 */
export enum AmountFormat {
  /**
   * denominated in the smallest unit of the source token
   */
  INT = "INT",
  /**
   * denominated in the unit of the source token
   */
  FLOAT = "FLOAT",
}
