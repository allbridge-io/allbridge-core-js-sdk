import { Big } from "big.js";
import { ChainSymbol } from "../../../chains";
import { Messenger } from "../../../client/core-api/core-api.model";
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
   *  The address of the owner of the tokens allowing the use of their tokens
   *
   */
  owner: string;
  /**
   *  The address of the contract that we allow to use tokens
   */
  spender: string;
  /**
   * The integer amount of tokens to approve.
   * Optional. Maximum amount is used if parameter not defined.
   */
  amount?: string | number | Big;
}

export interface ApproveDataWithTokenInfo {
  /**
   * The token info
   */
  token: TokenInfoWithChainDetails;
  /**
   *  The address of the owner of the tokens allowing the use of their tokens
   *
   */
  owner: string;
  /**
   *  The address of the contract that we allow to use tokens
   */
  spender: string;
  /**
   * The integer amount of tokens to approve.
   * Optional. Maximum amount is used if parameter not defined.
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
   * The amount of gas fee to pay for the transfer in the smallest denomination of the source chain currency.
   */
  fee?: string;
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
export interface CheckAllowanceParamsWithTokenAddress
  extends GetAllowanceParamsWithTokenAddress {
  /**
   * The float amount of tokens to check allowance.
   */
  amount: string | number | Big;
}

export interface CheckAllowanceParamsWithTokenInfo
  extends GetAllowanceParamsWithTokenInfo {
  /**
   * The float amount of tokens to check allowance.
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
   * The integer amount of tokens to check allowance.
   */
  amount: string | number | Big;
}
