// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface DepositEventArgs {
  amount: bigint | TransactionArgument;
  lpAmount: bigint | TransactionArgument;
}

export function depositEvent(tx: Transaction, typeArg: string, args: DepositEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::deposit_event`,
    typeArguments: [typeArg],
    arguments: [pure(tx, args.amount, `u64`), pure(tx, args.lpAmount, `u64`)],
  });
}

export interface ReceiveFeeEventArgs {
  userPaySui: bigint | TransactionArgument;
  userPayStable: bigint | TransactionArgument;
  totalPaySui: bigint | TransactionArgument;
  bridgeFeeSui: bigint | TransactionArgument;
  messengerFeeSui: bigint | TransactionArgument;
  totalFeeSui: bigint | TransactionArgument;
}

export function receiveFeeEvent(tx: Transaction, args: ReceiveFeeEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::receive_fee_event`,
    arguments: [
      pure(tx, args.userPaySui, `u64`),
      pure(tx, args.userPayStable, `u64`),
      pure(tx, args.totalPaySui, `u64`),
      pure(tx, args.bridgeFeeSui, `u64`),
      pure(tx, args.messengerFeeSui, `u64`),
      pure(tx, args.totalFeeSui, `u64`),
    ],
  });
}

export function rewardsClaimedEvent(tx: Transaction, typeArg: string, amount: bigint | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::rewards_claimed_event`,
    typeArguments: [typeArg],
    arguments: [pure(tx, amount, `u64`)],
  });
}

export interface SwappedEventArgs {
  sentAmount: bigint | TransactionArgument;
  receivedAmount: bigint | TransactionArgument;
  sender: string | TransactionArgument;
}

export function swappedEvent(tx: Transaction, typeArgs: [string, string], args: SwappedEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::swapped_event`,
    typeArguments: typeArgs,
    arguments: [
      pure(tx, args.sentAmount, `u64`),
      pure(tx, args.receivedAmount, `u64`),
      pure(tx, args.sender, `address`),
    ],
  });
}

export interface SwappedFromVusdEventArgs {
  amount: bigint | TransactionArgument;
  vusdAmount: bigint | TransactionArgument;
  fee: bigint | TransactionArgument;
}

export function swappedFromVusdEvent(tx: Transaction, typeArg: string, args: SwappedFromVusdEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::swapped_from_vusd_event`,
    typeArguments: [typeArg],
    arguments: [pure(tx, args.amount, `u64`), pure(tx, args.vusdAmount, `u64`), pure(tx, args.fee, `u64`)],
  });
}

export interface SwappedToVusdEventArgs {
  amount: bigint | TransactionArgument;
  vusdAmount: bigint | TransactionArgument;
  fee: bigint | TransactionArgument;
}

export function swappedToVusdEvent(tx: Transaction, typeArg: string, args: SwappedToVusdEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::swapped_to_vusd_event`,
    typeArguments: [typeArg],
    arguments: [pure(tx, args.amount, `u64`), pure(tx, args.vusdAmount, `u64`), pure(tx, args.fee, `u64`)],
  });
}

export interface TokensReceivedEventArgs {
  amount: bigint | TransactionArgument;
  extraGasAmount: bigint | TransactionArgument;
  recipient: string | TransactionArgument;
  nonce: bigint | TransactionArgument;
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function tokensReceivedEvent(tx: Transaction, typeArg: string, args: TokensReceivedEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::tokens_received_event`,
    typeArguments: [typeArg],
    arguments: [
      pure(tx, args.amount, `u64`),
      pure(tx, args.extraGasAmount, `u64`),
      pure(tx, args.recipient, `address`),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.messenger),
      obj(tx, args.message),
    ],
  });
}

export interface TokensSentEventArgs {
  vusdAmount: bigint | TransactionArgument;
  sender: string | TransactionArgument;
  recipient: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  messenger: TransactionObjectInput;
}

export function tokensSentEvent(tx: Transaction, typeArg: string, args: TokensSentEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::tokens_sent_event`,
    typeArguments: [typeArg],
    arguments: [
      pure(tx, args.vusdAmount, `u64`),
      pure(tx, args.sender, `address`),
      obj(tx, args.recipient),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.messenger),
    ],
  });
}

export interface WithdrawEventArgs {
  amount: bigint | TransactionArgument;
  lpAmount: bigint | TransactionArgument;
}

export function withdrawEvent(tx: Transaction, typeArg: string, args: WithdrawEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::withdraw_event`,
    typeArguments: [typeArg],
    arguments: [pure(tx, args.amount, `u64`), pure(tx, args.lpAmount, `u64`)],
  });
}
