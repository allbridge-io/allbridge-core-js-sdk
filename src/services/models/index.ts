import { VersionedTransaction } from "@solana/web3.js";
import type { TronWeb } from "tronweb-typings";

import type Web3 from "web3";
import { TransactionConfig } from "web3-core";

/**
 * The provider is type that combines connection implementations for different chains.<br/>
 * TIP: None provider in the Solana blockchain case.
 */
export type Provider = Web3 | TronWeb;

/**
 * EVM TransactionConfig
 * Solana VersionedTransaction
 * Tron Object
 * Soroban string
 */
export type RawTransaction = Object | VersionedTransaction | TransactionConfig | string;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}

export interface TransactionResponse {
  txId: string;
}
