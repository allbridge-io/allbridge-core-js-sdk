// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function new_(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::new`,
    arguments: [],
  });
}

export interface CrossRateArgs {
  oracle: TransactionObjectInput;
  otherChainId: number | TransactionArgument;
}

export function crossRate(tx: Transaction, args: CrossRateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::cross_rate`,
    arguments: [obj(tx, args.oracle), pure(tx, args.otherChainId, `u8`)],
  });
}

export function gasPrice(tx: Transaction, chainData: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::gas_price`,
    arguments: [obj(tx, chainData)],
  });
}

export interface GetChainDataArgs {
  oracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getChainData(tx: Transaction, args: GetChainDataArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_chain_data`,
    arguments: [obj(tx, args.oracle), pure(tx, args.chainId, `u8`)],
  });
}

export function getId(tx: Transaction, oracle: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_id`,
    arguments: [obj(tx, oracle)],
  });
}

export function getOwnChainData(tx: Transaction, oracle: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_own_chain_data`,
    arguments: [obj(tx, oracle)],
  });
}

export interface GetTransactionGasCostInNativeTokenArgs {
  oracle: TransactionObjectInput;
  otherChainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
}

export function getTransactionGasCostInNativeToken(tx: Transaction, args: GetTransactionGasCostInNativeTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_transaction_gas_cost_in_native_token`,
    arguments: [obj(tx, args.oracle), pure(tx, args.otherChainId, `u8`), pure(tx, args.gasAmount, `u64`)],
  });
}

export interface GetTransactionGasCostInStableArgs {
  oracle: TransactionObjectInput;
  otherChainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
  stableTokenDecimals: number | TransactionArgument;
}

export function getTransactionGasCostInStable(tx: Transaction, args: GetTransactionGasCostInStableArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_transaction_gas_cost_in_stable`,
    arguments: [
      obj(tx, args.oracle),
      pure(tx, args.otherChainId, `u8`),
      pure(tx, args.gasAmount, `u64`),
      pure(tx, args.stableTokenDecimals, `u8`),
    ],
  });
}

export function getVersion(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::get_version`,
    arguments: [],
  });
}

export function init(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::init`,
    arguments: [],
  });
}

export interface MigrateArgs {
  adminCap: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::migrate`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.gasOracle)],
  });
}

export function price(tx: Transaction, chainData: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::price`,
    arguments: [obj(tx, chainData)],
  });
}

export interface SetChainDataArgs {
  oracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasPrice: bigint | TransactionArgument;
  price: bigint | TransactionArgument;
}

export function setChainData(tx: Transaction, args: SetChainDataArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::set_chain_data`,
    arguments: [
      obj(tx, args.oracle),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.gasPrice, `u128`),
      pure(tx, args.price, `u128`),
    ],
  });
}

export interface SetGasPriceArgs {
  oracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasPrice: bigint | TransactionArgument;
}

export function setGasPrice(tx: Transaction, args: SetGasPriceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::set_gas_price`,
    arguments: [obj(tx, args.oracle), pure(tx, args.chainId, `u8`), pure(tx, args.gasPrice, `u128`)],
  });
}

export interface SetPriceArgs {
  oracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
  price: bigint | TransactionArgument;
}

export function setPrice(tx: Transaction, args: SetPriceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::set_price`,
    arguments: [obj(tx, args.oracle), pure(tx, args.chainId, `u8`), pure(tx, args.price, `u128`)],
  });
}

export interface StableToSuiAmountArgs {
  gasOracle: TransactionObjectInput;
  amount: bigint | TransactionArgument;
  stableTokenDecimals: number | TransactionArgument;
}

export function stableToSuiAmount(tx: Transaction, args: StableToSuiAmountArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::gas_oracle::stable_to_sui_amount`,
    arguments: [obj(tx, args.gasOracle), pure(tx, args.amount, `u64`), pure(tx, args.stableTokenDecimals, `u8`)],
  });
}
