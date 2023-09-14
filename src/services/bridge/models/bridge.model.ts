import { Big } from "big.js";
import { ChainSymbolType } from "../../../chains";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AmountFormat, FeePaymentMethod } from "../../../models";
import { TokenWithChainDetails } from "../../../tokens-info";

export interface ApproveParams {
  /**
   * The token info
   */
  token: TokenWithChainDetails;

  /**
   *  The address of the token owner who is granting permission to use tokens
   */
  owner: string;

  /**
   * The integer amount of tokens to approve.
   * Optional.
   * The maximum amount by default.
   */
  amount?: string | number | Big;
}

export interface GetTokenBalanceParams {
  /**
   *  The address for which we will find out the token balance
   */
  account: string;
  token: TokenWithChainDetails;
}

export interface BaseSendParams {
  /**
   * The float amount of Total tokens to transfer.
   *
   * In Send case
   * If {@link SendParams#gasFeePaymentMethod} is {@link FeePaymentMethod#WITH_STABLECOIN}:<br/>
   * Includes gas fee<br/>
   * Includes extra gas
   */
  amount: string;
  /**
   * The account address to transfer tokens from.
   */
  fromAccountAddress: string;
  /**
   * The account address to transfer tokens to.
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
}

/**
 * Required params to handle swap transfer (different tokens on the same chain)
 */
export interface SwapParams extends BaseSendParams {
  /**
   * minimum amount to receive including possible slippage, see {@link AllbridgeCoreSdk#getAmountToBeReceived}
   */
  minimumReceiveAmount?: string;
}

/**
 * Required params to handle bridge transfer (transfer between chains)
 */
export interface SendParams extends BaseSendParams {
  /**
   * The Messenger to use.
   */
  messenger: Messenger;
  /**
   * The amount of gas fee to pay for the transfer.
   *
   * If {@link gasFeePaymentMethod} is {@link FeePaymentMethod#WITH_NATIVE_CURRENCY} then
   * it is amount of the source chain currency.<p/>
   * If {@link gasFeePaymentMethod} is {@link FeePaymentMethod#WITH_STABLECOIN} then
   * it is amount of the source token.
   *
   * Optional.
   * If not defined, the default fee amount will be applied according to gasFeePaymentMethod.
   * See method {@link AllbridgeCoreSdk#getGasFeeOptions} to get required gas fee amount.
   */
  fee?: string;
  /**
   * Format of fee value.<p/>
   * Optional.
   * {@link AmountFormat.INT} by default.
   */
  feeFormat?: AmountFormat;
  /**
   * The amount of extra gas to transfer to gas on destination chain with the transfer.<br/>
   * To get maximum supported value, look {@link AllbridgeCoreSdk#getExtraGasMaxLimits}
   *
   * If gasFeePaymentMethod is {@link FeePaymentMethod#WITH_NATIVE_CURRENCY} then
   * it is amount of the source chain currency.<p/>
   * if gasFeePaymentMethod is {@link FeePaymentMethod#WITH_STABLECOIN} then
   * it is amount of the source token.
   *
   * Optional.
   */
  extraGas?: string;
  /**
   * Format of extra gas value.<p/>
   * Optional.
   * {@link AmountFormat.INT} by default.
   */
  extraGasFormat?: AmountFormat;
  /**
   * Payment method for the gas fee and extra gas payment.
   *
   * WITH_NATIVE_CURRENCY - gas fee and extra gas will be added to transaction as native tokens value
   * WITH_STABLECOIN - gas fee and extra gas will be deducted from the transaction amount
   *
   * Optional.
   * WITH_NATIVE_CURRENCY by default.
   */
  gasFeePaymentMethod?: FeePaymentMethod;
}

export interface GetAllowanceParams {
  token: TokenWithChainDetails;
  owner: string;
  gasFeePaymentMethod?: FeePaymentMethod;
}

export type GetAllowanceParamsDto = GetAllowanceParams;

export interface CheckAllowanceParams extends GetAllowanceParams {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

type AccountAddress = string | number[];

/**
 * @internal
 */
export interface TxSwapParams {
  amount: string;
  contractAddress: string;
  fromAccountAddress: string;
  fromTokenAddress: AccountAddress;
  toAccountAddress: AccountAddress;
  toTokenAddress: AccountAddress;
  minimumReceiveAmount: string;
}

/**
 * @internal
 */
export interface TxSendParams {
  amount: string;
  contractAddress: string;
  fromChainId: number;
  fromChainSymbol: ChainSymbolType;
  fromAccountAddress: string;
  fromTokenAddress: AccountAddress;
  toChainId: number;
  toAccountAddress: AccountAddress;
  toTokenAddress: AccountAddress;
  messenger: Messenger;
  /**
   * int format
   */
  fee: string;
  /**
   * int format
   */
  extraGas?: string;
  gasFeePaymentMethod: FeePaymentMethod;
}
