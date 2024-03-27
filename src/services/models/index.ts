import { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { TronWeb } from "tronweb-typings";

import type Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { SolanaTxFee } from "./sol";

export { SolanaTxFee, PricePerUnitInMicroLamports, ExtraFeeInLamports, SolanaAutoTxFee } from "./sol";

/**
 * Blockchain fee added to tx
 */
export interface TxFeeParams {
  solana?: SolanaTxFee;
}

/**
 * The provider is type that combines connection implementations for different chains.<br/>
 * TIP: None provider in the Solana blockchain case.
 */
export type Provider = Web3 | TronWeb;

export type RawTransaction =
  | RawTronTransaction
  | RawEvmTransaction
  | RawSorobanTransaction
  | RawBridgeSolanaTransaction
  | RawPoolSolanaTransaction;
export type RawEvmTransaction = TransactionConfig;
export type RawTronTransaction = Object;
export type RawSorobanTransaction = string;
export type RawPoolSolanaTransaction = Transaction;
export type RawBridgeSolanaTransaction = VersionedTransaction;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}

export interface TransactionResponse {
  txId: string;
}
