// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface NewArgs {
  coinMetadata: TransactionObjectInput;
  a: bigint | TransactionArgument;
  feeShareBp: bigint | TransactionArgument;
}

export function new_(tx: Transaction, typeArg: string, args: NewArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::new`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.coinMetadata), pure(tx, args.a, `u64`), pure(tx, args.feeShareBp, `u64`)],
  });
}

export function balance(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function decimals(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::decimals`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export interface DepositArgs {
  pool: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function deposit(tx: Transaction, typeArg: string, args: DepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.userDeposit), obj(tx, args.coin)],
  });
}

export interface WithdrawArgs {
  pool: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  amountLp: bigint | TransactionArgument;
}

export function withdraw(tx: Transaction, typeArg: string, args: WithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.userDeposit), pure(tx, args.amountLp, `u64`)],
  });
}

export function state(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::state`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function init(tx: Transaction) {
  return tx.moveCall({ target: `${PUBLISHED_AT}::pool::init`, arguments: [] });
}

export function rewards(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::rewards`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function claimAdminFee(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::claim_admin_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export interface ClaimRewardArgs {
  pool: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function claimReward(tx: Transaction, typeArg: string, args: ClaimRewardArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::claim_reward`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.userDeposit)],
  });
}

export interface SetAdminFeeShareBpArgs {
  pool: TransactionObjectInput;
  adminFeeShareBp: bigint | TransactionArgument;
}

export function setAdminFeeShareBp(tx: Transaction, typeArg: string, args: SetAdminFeeShareBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::set_admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), pure(tx, args.adminFeeShareBp, `u64`)],
  });
}

export interface SetBalanceRatioMinBpArgs {
  pool: TransactionObjectInput;
  balanceRatioMinBp: bigint | TransactionArgument;
}

export function setBalanceRatioMinBp(tx: Transaction, typeArg: string, args: SetBalanceRatioMinBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::set_balance_ratio_min_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), pure(tx, args.balanceRatioMinBp, `u64`)],
  });
}

export interface AdjustTotalLpAmountArgs {
  pool: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function adjustTotalLpAmount(tx: Transaction, typeArg: string, args: AdjustTotalLpAmountArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::adjust_total_lp_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.userDeposit)],
  });
}

export function canDeposit(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::can_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function canWithdraw(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::can_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function feeShare(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::fee_share`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export interface FromSystemPrecisionArgs {
  pool: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function fromSystemPrecision(tx: Transaction, typeArg: string, args: FromSystemPrecisionArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::from_system_precision`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), pure(tx, args.amount, `u64`)],
  });
}

export interface GetFeeArgs {
  pool: TransactionObjectInput;
  coin: TransactionObjectInput;
  zeroFee: boolean | TransactionArgument;
}

export function getFee(tx: Transaction, typeArg: string, args: GetFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::get_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.coin), pure(tx, args.zeroFee, `bool`)],
  });
}

export interface SetFeeShareArgs {
  pool: TransactionObjectInput;
  feeShareBp: bigint | TransactionArgument;
}

export function setFeeShare(tx: Transaction, typeArg: string, args: SetFeeShareArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::set_fee_share`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), pure(tx, args.feeShareBp, `u64`)],
  });
}

export function startDeposit(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::start_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function startWithdraw(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::start_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function stopDeposit(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::stop_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export function stopWithdraw(tx: Transaction, typeArg: string, pool: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::stop_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, pool)],
  });
}

export interface SwapFromVusdArgs {
  pool: TransactionObjectInput;
  vusdAmount: bigint | TransactionArgument;
  receiveAmountMin: bigint | TransactionArgument;
  zeroFee: boolean | TransactionArgument;
}

export function swapFromVusd(tx: Transaction, typeArg: string, args: SwapFromVusdArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::swap_from_vusd`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.pool),
      pure(tx, args.vusdAmount, `u64`),
      pure(tx, args.receiveAmountMin, `u64`),
      pure(tx, args.zeroFee, `bool`),
    ],
  });
}

export interface SwapToVusdArgs {
  pool: TransactionObjectInput;
  coin: TransactionObjectInput;
  zeroFee: boolean | TransactionArgument;
}

export function swapToVusd(tx: Transaction, typeArg: string, args: SwapToVusdArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::swap_to_vusd`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), obj(tx, args.coin), pure(tx, args.zeroFee, `bool`)],
  });
}

export interface ToSystemPrecisionArgs {
  pool: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function toSystemPrecision(tx: Transaction, typeArg: string, args: ToSystemPrecisionArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool::to_system_precision`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.pool), pure(tx, args.amount, `u64`)],
  });
}
