import { Big } from "big.js";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import Web3 from "web3";
import { ChainSymbol } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";
import { TokenInfoWithChainDetails } from "../../tokens-info";

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
}

export interface GetTokenBalanceData {
  tokenAddress: string;
  account: string;
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
  fromAccountAddress: string;
  fromTokenAddress: AccountAddress;
  toChainId: number;
  toAccountAddress: AccountAddress;
  toTokenAddress: AccountAddress;
  messenger: Messenger;
  fee: string;
}

export type GetAllowanceParamsDto = GetAllowanceParamsWithTokenInfo;

/**
 * @internal
 */
export interface CheckAllowanceParamsDto extends GetAllowanceParamsDto {
  /**
   * The float amount of tokens to check allowance.
   */
  amount: string | number | Big;
}

/**
 * The provider is type that combines connection implementations for different chains.
 */
export type Provider = Web3 | typeof TronWeb;

export type RawTransaction = Object;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}
