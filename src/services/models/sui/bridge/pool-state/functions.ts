// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function a(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::a`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export function new_(tx: Transaction, typeArg: string, a: bigint | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::new`,
    typeArguments: [typeArg],
    arguments: [pure(tx, a, `u64`)],
  });
}

export function sqrt(tx: Transaction, n: bigint | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::sqrt`,
    arguments: [pure(tx, n, `u256`)],
  });
}

export function d(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::d`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export interface AddTokenBalanceArgs {
  poolState: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function addTokenBalance(tx: Transaction, typeArg: string, args: AddTokenBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::add_token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.amount, `u64`)],
  });
}

export interface AddVusdBalanceArgs {
  poolState: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function addVusdBalance(tx: Transaction, typeArg: string, args: AddVusdBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::add_vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.amount, `u64`)],
  });
}

export function cbrt(tx: Transaction, n: bigint | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::cbrt`,
    arguments: [pure(tx, n, `u256`)],
  });
}

export function getBalanceRatioMinBp(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::get_balance_ratio_min_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export interface GetDArgs {
  a: bigint | TransactionArgument;
  x: bigint | TransactionArgument;
  y: bigint | TransactionArgument;
}

export function getD(tx: Transaction, args: GetDArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::get_d`,
    arguments: [pure(tx, args.a, `u64`), pure(tx, args.x, `u64`), pure(tx, args.y, `u64`)],
  });
}

export interface GetYArgs {
  poolState: TransactionObjectInput;
  nativeX: bigint | TransactionArgument;
}

export function getY(tx: Transaction, typeArg: string, args: GetYArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::get_y`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.nativeX, `u64`)],
  });
}

export interface SetBalanceRatioMinBpArgs {
  poolState: TransactionObjectInput;
  balanceRatioMinBp: bigint | TransactionArgument;
}

export function setBalanceRatioMinBp(tx: Transaction, typeArg: string, args: SetBalanceRatioMinBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::set_balance_ratio_min_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.balanceRatioMinBp, `u64`)],
  });
}

export interface SetTokenBalanceArgs {
  poolState: TransactionObjectInput;
  tokenBalance: bigint | TransactionArgument;
}

export function setTokenBalance(tx: Transaction, typeArg: string, args: SetTokenBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::set_token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.tokenBalance, `u64`)],
  });
}

export function tokenBalance(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export interface SetVusdBalanceArgs {
  poolState: TransactionObjectInput;
  vusdBalance: bigint | TransactionArgument;
}

export function setVusdBalance(tx: Transaction, typeArg: string, args: SetVusdBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::set_vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.vusdBalance, `u64`)],
  });
}

export function vusdBalance(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export interface SubTokenBalanceArgs {
  poolState: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function subTokenBalance(tx: Transaction, typeArg: string, args: SubTokenBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::sub_token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.amount, `u64`)],
  });
}

export interface SubVusdBalanceArgs {
  poolState: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function subVusdBalance(tx: Transaction, typeArg: string, args: SubVusdBalanceArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::sub_vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolState), pure(tx, args.amount, `u64`)],
  });
}

export function updateD(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::update_d`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export function updateTokenBalance(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::update_token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export function updateVusdBalance(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::update_vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}

export function validateBalanceRatio(tx: Transaction, typeArg: string, poolState: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_state::validate_balance_ratio`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolState)],
  });
}
