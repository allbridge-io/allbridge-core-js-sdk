// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { GenericArg, generic, obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function new_(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::fee_collector::new`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export function key(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::fee_collector::key`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export function balance(tx: Transaction, typeArgs: [string, string], feeCollector: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::fee_collector::balance`,
    typeArguments: typeArgs,
    arguments: [obj(tx, feeCollector)],
  });
}

export interface WithdrawArgs {
  cap: GenericArg;
  feeCollector: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdraw(tx: Transaction, typeArgs: [string, string], args: WithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::fee_collector::withdraw`,
    typeArguments: typeArgs,
    arguments: [generic(tx, `${typeArgs[1]}`, args.cap), obj(tx, args.feeCollector), pure(tx, args.amount, `u64`)],
  });
}

export interface AddFeeArgs {
  feeCollector: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function addFee(tx: Transaction, typeArgs: [string, string], args: AddFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::fee_collector::add_fee`,
    typeArguments: typeArgs,
    arguments: [obj(tx, args.feeCollector), obj(tx, args.coin)],
  });
}
