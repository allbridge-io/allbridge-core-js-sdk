export {
  ApproveParams as BridgeApproveParams,
  BaseSendParams,
  CheckAllowanceParams,
  GetAllowanceParams,
  GetTokenBalanceParams,
  SendParams,
  SwapParams,
} from "../services/bridge/models/bridge.model";
export { BridgeService } from "../services/bridge/index";
export { TokenService } from "../services/token/index";
export { LiquidityPoolService } from "../services/liquidity-pool/index";
export { TransactionResponse } from "../services/models/index";
export { Messenger, TransferStatusResponse, BridgeTransaction } from "../client/core-api/core-api.model";
export { ChainSymbol, ChainType } from "../chains/index";
export { RawBridgeTransactionBuilder } from "../services/bridge/raw-bridge-transaction-builder";
export { RawPoolTransactionBuilder } from "../services/liquidity-pool/raw-pool-transaction-builder";
export {
  PoolInfo,
  TokenWithChainDetails,
  TransferTime,
  TxCostAmount,
  MessengerTransferTime,
} from "../tokens-info/tokens-info.model";
export {
  ApproveParams as TokensApproveParams,
  CheckAllowanceParams as TokensCheckAllowanceParams,
  GetAllowanceParams as TokensGetAllowanceParams,
  GetTokenBalanceParams as TokensGetTokenBalanceParams,
} from "../services/token/models/token.model";
export {
  UserBalanceInfo,
  UserBalanceInfoDTO,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  ApproveParams as LiquidityPoolsApproveParams,
  CheckAllowanceParams as LiquidityPoolsCheckAllowanceParams,
  GetAllowanceParams as LiquidityPoolsGetAllowanceParams,
} from "../services/liquidity-pool/models/pool.model";
export { Provider, RawTransaction } from "../services/models/index";
export {
  SwapAndBridgeCalculationData,
  SwapFromVUsdCalcResult,
  SwapToVUsdCalcResult,
} from "../utils/calculation/swap-and-bridge-fee-calc";

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

type GasFeeOptionsType = {
  [key in FeePaymentMethod]?: AmountFormatted;
};

/**
 * Describes available options of paying the gas fee and the amount to pay when using the corresponding method.
 *
 * For {@link FeePaymentMethod.WITH_NATIVE_CURRENCY} value contains the amount in the smallest denomination of the source chain currency
 *
 * For {@link FeePaymentMethod.WITH_STABLECOIN} value contains the amount in the smallest denomination of the source token
 */
export interface GasFeeOptions extends GasFeeOptionsType {
  [FeePaymentMethod.WITH_NATIVE_CURRENCY]: AmountFormatted;
  [FeePaymentMethod.WITH_STABLECOIN]?: AmountFormatted;
}

/**
 * Define the type of amount data<p/>
 * Example:<p/>
 *  "1500000" USDC {@link AmountFormat.INT} = "1.5" USDC {@link AmountFormat.FLOAT}, if USDC.decimals = 6
 */
export enum AmountFormat {
  /**
   * denominated in the smallest unit of the source token
   */
  INT = "int",
  /**
   * denominated in the unit of the source token
   */
  FLOAT = "float",
}

/**
 * Describes the same amount in two variation formats.
 *
 * For {@link AmountFormat.INT} value contains the amount in tokens denomination
 *
 * For {@link AmountFormat.FLOAT} value contains the amount in the smallest denomination
 */
export type AmountFormatted = {
  [key in AmountFormat]: string;
};

/**
 * Describes MAX extra gas value can to be passed when using the corresponding method.
 *
 * For {@link FeePaymentMethod.WITH_NATIVE_CURRENCY} value contains {@link ExtraGasMaxLimit} the amount of the source chain currency
 *
 * For {@link FeePaymentMethod.WITH_STABLECOIN} value contains {@link ExtraGasMaxLimit} the amount of the source token
 */
export type ExtraGasMaxLimits = {
  [key in FeePaymentMethod]?: ExtraGasMaxLimit;
};

/**
 * Describes the same MAX extra gas amount.
 */
export type ExtraGasMaxLimit = AmountFormatted;

/**
 * Provide extra gas information
 */
export interface ExtraGasMaxLimitResponse {
  /**
   * See {@link ExtraGasMaxLimits}
   */
  extraGasMax: ExtraGasMaxLimits;
  /**
   * Information due to destination chain
   */
  destinationChain: {
    /**
     *  gasAmountMax maximum amount you can receive as extra gas on dest chain
     */
    gasAmountMax: ExtraGasMaxLimit;
    /**
     * cost of swap tx on chain
     */
    swap: AmountFormatted;
    /**
     * cost of send tx on chain
     */
    transfer: AmountFormatted;
  };
  /**
   * Exchange rate
   */
  exchangeRate: string;
  /**
   * Source native token price
   */
  sourceNativeTokenPrice: string;
}
