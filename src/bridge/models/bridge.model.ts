import { Big } from "big.js";
import { TronWeb } from "tronweb-typings";
import Web3 from "web3";
import { ChainSymbol, ChainType } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";
import { TokenInfoWithChainDetails } from "../../tokens-info";

export abstract class Bridge {
  abstract chainType: ChainType;
  abstract getTokenBalance(data: GetTokenBalanceData): Promise<string>;

  abstract sendTx(params: TxSendParams): Promise<TransactionResponse>;
}

export abstract class ApprovalBridge extends Bridge {
  async isNeededApprove(approveData: ApproveData): Promise<boolean> {
    const allowance = await this.getAllowance(approveData);
    return Big(allowance).eq(0);
  }

  abstract approve(approveData: ApproveData): Promise<TransactionResponse>;

  abstract getAllowance(approveData: ApproveData): Promise<string>;
}

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

export interface TxSendParams {
  amount: string;
  contractAddress: string;
  fromAccountAddress: string;
  fromTokenAddress: string | number[];
  toChainId: number;
  toAccountAddress: string | number[];
  toTokenAddress: string | number[];
  messenger: Messenger;
  fee: string;
}

/**
 * The provider is type that combines connection implementations for different chains.
 */
export type Provider = Web3 | TronWeb;
