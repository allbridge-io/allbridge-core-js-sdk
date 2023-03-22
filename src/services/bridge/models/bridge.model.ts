import { Big } from "big.js";
import { ChainSymbol } from "../../../chains";
import { Messenger } from "../../../client/core-api/core-api.model";
import { FeePaymentMethod } from "../../../models";
import { TokenInfoWithChainDetails } from "../../../tokens-info";

/**
 * @deprecated Please use {@link ApproveDataWithTokenInfo} instead
 */
export interface ApproveData {
  /**
   * The token address itself
   */
  tokenAddress: string;

  /**
   *  The address of the token owner who is granting permission to use tokens
   *  to the spender
   */
  owner: string;

  /**
   *  The address of the contract that is being granted permission to use tokens
   */
  spender: string;

  /**
   * The integer amount of tokens to approve.
   * Optional.
   * The maximum amount by default.
   */
  amount?: string | number | Big;
}

export interface ApproveDataWithTokenInfo {
  /**
   * The token info
   */
  token: TokenInfoWithChainDetails;

  /**
   *  The address of the token owner who is granting permission to use tokens
   *  to the spender
   */
  owner: string;

  /**
   *  The address of the contract that is being granted permission to use tokens
   */
  spender: string;

  /**
   * The integer amount of tokens to approve.
   * Optional.
   * The maximum amount by default.
   */
  amount?: string | number | Big;
}

/**
 * @deprecated Please use {@link GetTokenBalanceParamsWithTokenInfo} instead
 */
export interface GetTokenBalanceParamsWithTokenAddress {
  /**
   *  The address for which we will find out the token balance
   */
  account: string;
  /**
   *  The token address itself
   */
  tokenAddress: string;
  /**
   *  If present, the result will be recalculated in precision with token decimals
   */
  tokenDecimals?: number;
}

export interface GetTokenBalanceParamsWithTokenInfo {
  /**
   *  The address for which we will find out the token balance
   */
  account: string;
  tokenInfo: TokenInfoWithChainDetails;
}

export interface TransactionResponse {
  txId: string;
}

/**
 * @internal
 */
export interface BaseSendParams {
  /**
   * The float amount of tokens to transfer.
   * (Includes gas fee if `gasFeePaymentMethod` is FeePaymentMethod.WITH_STABLECOIN)
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
  messenger: Messenger;
  /**
   * The integer amount of gas fee to pay for the transfer.
   * If gasFeePaymentMethod is WITH_NATIVE_CURRENCY then
   * it is denominated in the smallest unit of the source chain currency.
   * if gasFeePaymentMethod is WITH_STABLECOIN then
   * it is denominated in the smallest unit of the source token.
   *
   * Optional.
   * If not defined, the default fee amount will be applied according to gasFeePaymentMethod.
   * See method {@link getGasFeeOptions} to get required gas fee amount.
   */
  fee?: string;

  /**
   * Payment method for the gas fee.
   *
   * WITH_NATIVE_CURRENCY - gas fee will be added to transaction as native tokens value
   * WITH_STABLECOIN - gas fee will be deducted from the transaction amount
   *
   * Optional.
   * WITH_NATIVE_CURRENCY by default.
   */
  gasFeePaymentMethod?: FeePaymentMethod;
}

/**
 * @deprecated Please use {@link SendParamsWithTokenInfos} instead
 */
export interface SendParamsWithChainSymbols extends BaseSendParams {
  /**
   * The chain symbol to transfer tokens from.
   */
  fromChainSymbol: ChainSymbol;
  /**
   * The token contract address on the source chain.
   */
  fromTokenAddress: string;
  /**
   * The chain symbol to transfer tokens to.
   */
  toChainSymbol: ChainSymbol;
  /**
   * The token contract address on the destination chain.
   */
  toTokenAddress: string;
}

export interface SendParamsWithTokenInfos extends BaseSendParams {
  /**
   * {@link TokenInfoWithChainDetails |The token info object} on the source chain.
   */
  sourceChainToken: TokenInfoWithChainDetails;
  /**
   * {@link TokenInfoWithChainDetails |The token info object} on the destination chain.
   */
  destinationChainToken: TokenInfoWithChainDetails;
}

/**
 * @deprecated Please use {@link CheckAllowanceParamsWithTokenInfo} instead
 */
export interface CheckAllowanceParamsWithTokenAddress extends GetAllowanceParamsWithTokenAddress {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

export interface CheckAllowanceParamsWithTokenInfo extends GetAllowanceParamsWithTokenInfo {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

/**
 * @deprecated Please use {@link GetAllowanceParamsWithTokenInfo} instead
 */
export interface GetAllowanceParamsWithTokenAddress {
  chainSymbol: ChainSymbol;
  tokenAddress: string;
  owner: string;
}

export interface GetAllowanceParamsWithTokenInfo {
  tokenInfo: TokenInfoWithChainDetails;
  owner: string;
  gasFeePaymentMethod?: FeePaymentMethod;
}

type AccountAddress = string | number[];

/**
 * @internal
 */
export interface TxSendParams {
  amount: string;
  contractAddress: string;
  fromChainId: number;
  fromChainSymbol: ChainSymbol;
  fromAccountAddress: string;
  fromTokenAddress: AccountAddress;
  toChainId: number;
  toAccountAddress: AccountAddress;
  toTokenAddress: AccountAddress;
  messenger: Messenger;
  fee: string;
  gasFeePaymentMethod: FeePaymentMethod;
}

export interface ApproveParamsDto {
  tokenAddress: string;
  chainSymbol: ChainSymbol;
  owner: string;
  spender: string;
  /**
   * Integer amount of tokens to approve.
   */
  amount?: string;
}

export type GetAllowanceParamsDto = GetAllowanceParamsWithTokenInfo;

/**
 * @internal
 */
export interface CheckAllowanceParamsDto extends GetAllowanceParamsDto {
  /**
   * The integer amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}
