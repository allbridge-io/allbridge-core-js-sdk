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
export { TokenWithChainDetails, TransferTime, MessengerTransferTime, Pool } from "../tokens-info/tokens-info.model";
export {
  UserBalanceInfo,
  UserBalanceInfoDTO,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
} from "../services/liquidity-pool/models/pool.model";
export { RawTransaction } from "../services/models/index";

export { testnet } from "../configs/testnet";

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
