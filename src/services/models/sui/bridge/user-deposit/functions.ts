// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface AddArgs {
  userDeposit: TransactionObjectInput;
  lpAmount: bigint | TransactionArgument;
  accRewardPerShareP: bigint | TransactionArgument;
}

export function add(tx: Transaction, typeArg: string, args: AddArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::add`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.userDeposit), pure(tx, args.lpAmount, `u64`), pure(tx, args.accRewardPerShareP, `u128`)],
  });
}

export function destroyEmpty(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::destroy_empty`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export interface RemoveArgs {
  userDeposit: TransactionObjectInput;
  lpAmount: bigint | TransactionArgument;
  accRewardPerShareP: bigint | TransactionArgument;
}

export function remove(tx: Transaction, typeArg: string, args: RemoveArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::remove`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.userDeposit), pure(tx, args.lpAmount, `u64`), pure(tx, args.accRewardPerShareP, `u128`)],
  });
}

export function new_(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::new`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export function lpAmount(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::lp_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export function rewardDebt(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::reward_debt`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export interface UpdateRewardDebtArgs {
  userDeposit: TransactionObjectInput;
  accRewardPerShareP: bigint | TransactionArgument;
}

export function updateRewardDebt(tx: Transaction, typeArg: string, args: UpdateRewardDebtArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::user_deposit::update_reward_debt`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.userDeposit), pure(tx, args.accRewardPerShareP, `u128`)],
  });
}
