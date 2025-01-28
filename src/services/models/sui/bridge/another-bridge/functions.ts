// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function destroyEmpty(tx: Transaction, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::destroy_empty`,
    arguments: [obj(tx, userDeposit)],
  });
}

export function new_(tx: Transaction, address: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::new`,
    arguments: [obj(tx, address)],
  });
}

export interface SetGasUsageArgs {
  anotherBridge: TransactionObjectInput;
  gasUsage: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::set_gas_usage`,
    arguments: [obj(tx, args.anotherBridge), pure(tx, args.gasUsage, `u64`)],
  });
}

export function gasUsage(tx: Transaction, anotherBridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::gas_usage`,
    arguments: [obj(tx, anotherBridge)],
  });
}

export interface AddTokenArgs {
  anotherBridge: TransactionObjectInput;
  address: TransactionObjectInput;
}

export function addToken(tx: Transaction, args: AddTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::add_token`,
    arguments: [obj(tx, args.anotherBridge), obj(tx, args.address)],
  });
}

export function bridgeAddress(tx: Transaction, anotherBridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::bridge_address`,
    arguments: [obj(tx, anotherBridge)],
  });
}

export interface HasTokenArgs {
  anotherBridge: TransactionObjectInput;
  address: TransactionObjectInput;
}

export function hasToken(tx: Transaction, args: HasTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::has_token`,
    arguments: [obj(tx, args.anotherBridge), obj(tx, args.address)],
  });
}

export interface RemoveTokenArgs {
  anotherBridge: TransactionObjectInput;
  address: TransactionObjectInput;
}

export function removeToken(tx: Transaction, args: RemoveTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::remove_token`,
    arguments: [obj(tx, args.anotherBridge), obj(tx, args.address)],
  });
}

export interface SetAddressArgs {
  anotherBridge: TransactionObjectInput;
  address: TransactionObjectInput;
}

export function setAddress(tx: Transaction, args: SetAddressArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::another_bridge::set_address`,
    arguments: [obj(tx, args.anotherBridge), obj(tx, args.address)],
  });
}
