import type { TronWeb } from "tronweb-typings";

import type Web3 from "web3";

/**
 * The provider is type that combines connection implementations for different chains.<br/>
 * TIP: None provider in the Solana blockchain case.
 */
export type Provider = Web3 | TronWeb;

export type RawTransaction = Object;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}

export interface TransactionResponse {
  txId: string;
}
