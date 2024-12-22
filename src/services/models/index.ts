import { Transaction as SolanaWeb3Transaction, VersionedTransaction } from "@solana/web3.js";
import { TronWeb } from "tronweb";
import { Transaction as TronWebTransaction } from "tronweb/src/types/Transaction";
import { Transaction } from "web3";
import { SolanaTxFee } from "./sol";

export { SolanaTxFee, PricePerUnitInMicroLamports, ExtraFeeInLamports, SolanaAutoTxFee } from "./sol";

/**
 * Blockchain fee added to tx
 */
export interface TxFeeParams {
  solana?: SolanaTxFee;
}

/**
 * The `EssentialWeb3` interface provides the minimum set of Web3 functionalities
 * required by the SDK. It allows any web3-like provider to be used, as long as it
 * matches the signature of these essential methods and properties. This prevents
 * tight coupling to a specific version of the `web3` library.
 */
export interface EssentialWeb3 {
  eth: {
    getBalance: (address: string) => Promise<any>;
    estimateGas: (tx: any) => Promise<any>;
    sendTransaction: (tx: any) => Promise<any>;
    Contract: new (abi: any, address?: string) => any;
    BatchRequest: new () => any;
  };
}

/**
 * The provider is type that combines connection implementations for different chains.<br/>
 * TIP: None provider in the Solana blockchain case.
 */
export type Provider = EssentialWeb3 | TronWeb;

export type RawTransaction =
  | RawTronTransaction
  | RawEvmTransaction
  | RawSorobanTransaction
  | RawBridgeSolanaTransaction
  | RawPoolSolanaTransaction;
export type RawEvmTransaction = Transaction;
export type RawTronTransaction = TronWebTransaction;
export type RawSorobanTransaction = string;
export type RawPoolSolanaTransaction = SolanaWeb3Transaction;
export type RawBridgeSolanaTransaction = VersionedTransaction;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}

export interface TransactionResponse {
  txId: string;
}
