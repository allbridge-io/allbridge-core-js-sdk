// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function new_(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::new`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export interface AddRewardsArgs {
  poolRewards: TransactionObjectInput;
  rewards: TransactionObjectInput;
}

export function addRewards(tx: Transaction, typeArg: string, args: AddRewardsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::add_rewards`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), obj(tx, args.rewards)],
  });
}

export function claimAdminFee(tx: Transaction, typeArg: string, poolRewards: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::claim_admin_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolRewards)],
  });
}

export interface ClaimRewardArgs {
  poolRewards: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function claimReward(tx: Transaction, typeArg: string, args: ClaimRewardArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::claim_reward`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), obj(tx, args.userDeposit)],
  });
}

export interface DepositLpArgs {
  poolRewards: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  lpAmount: bigint | TransactionArgument;
}

export function depositLp(tx: Transaction, typeArg: string, args: DepositLpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::deposit_lp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), obj(tx, args.userDeposit), pure(tx, args.lpAmount, `u64`)],
  });
}

export function getAdminFeeShareBp(tx: Transaction, typeArg: string, poolRewards: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::get_admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolRewards)],
  });
}

export function lpSupply(tx: Transaction, typeArg: string, poolRewards: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::lp_supply`,
    typeArguments: [typeArg],
    arguments: [obj(tx, poolRewards)],
  });
}

export interface PendingRewardsArgs {
  poolRewards: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function pendingRewards(tx: Transaction, typeArg: string, args: PendingRewardsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::pending_rewards`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), obj(tx, args.userDeposit)],
  });
}

export interface SetAdminFeeShareBpArgs {
  poolRewards: TransactionObjectInput;
  adminFeeShareBp: bigint | TransactionArgument;
}

export function setAdminFeeShareBp(tx: Transaction, typeArg: string, args: SetAdminFeeShareBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::set_admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), pure(tx, args.adminFeeShareBp, `u64`)],
  });
}

export interface WithdrawLpArgs {
  poolRewards: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  lpAmount: bigint | TransactionArgument;
}

export function withdrawLp(tx: Transaction, typeArg: string, args: WithdrawLpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::pool_rewards::withdraw_lp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.poolRewards), obj(tx, args.userDeposit), pure(tx, args.lpAmount, `u64`)],
  });
}
