// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { GenericArg, generic, obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface AssertVersionArgs {
  id: TransactionObjectInput;
  version: bigint | TransactionArgument;
}

export function assertVersion(tx: Transaction, typeArg: string, args: AssertVersionArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::version::assert_version`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.id), pure(tx, args.version, `u64`)],
  });
}

export interface InitVersionArgs {
  cap: GenericArg;
  id: TransactionObjectInput;
  version: bigint | TransactionArgument;
}

export function initVersion(tx: Transaction, typeArg: string, args: InitVersionArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::version::init_version`,
    typeArguments: [typeArg],
    arguments: [generic(tx, `${typeArg}`, args.cap), obj(tx, args.id), pure(tx, args.version, `u64`)],
  });
}

export interface MigrateVersionArgs {
  cap: GenericArg;
  id: TransactionObjectInput;
  newVersion: bigint | TransactionArgument;
}

export function migrateVersion(tx: Transaction, typeArg: string, args: MigrateVersionArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::version::migrate_version`,
    typeArguments: [typeArg],
    arguments: [generic(tx, `${typeArg}`, args.cap), obj(tx, args.id), pure(tx, args.newVersion, `u64`)],
  });
}
