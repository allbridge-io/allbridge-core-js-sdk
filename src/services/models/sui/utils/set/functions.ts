// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { GenericArg, generic, obj } from "../../_framework/util";
import { Transaction, TransactionObjectInput } from "@mysten/sui/transactions";

export interface AddArgs {
  set: TransactionObjectInput;
  key: GenericArg;
}

export function add(tx: Transaction, typeArg: string, args: AddArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::set::add`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.set), generic(tx, `${typeArg}`, args.key)],
  });
}

export interface ContainsArgs {
  set: TransactionObjectInput;
  key: GenericArg;
}

export function contains(tx: Transaction, typeArg: string, args: ContainsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::set::contains`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.set), generic(tx, `${typeArg}`, args.key)],
  });
}

export function destroyEmpty(tx: Transaction, typeArg: string, set: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::set::destroy_empty`,
    typeArguments: [typeArg],
    arguments: [obj(tx, set)],
  });
}

export interface RemoveArgs {
  set: TransactionObjectInput;
  key: GenericArg;
}

export function remove(tx: Transaction, typeArg: string, args: RemoveArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::set::remove`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.set), generic(tx, `${typeArg}`, args.key)],
  });
}

export function new_(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::set::new`,
    typeArguments: [typeArg],
    arguments: [],
  });
}
