// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface MessageReceivedEventArgs {
  message: TransactionObjectInput;
  sequence: bigint | TransactionArgument;
}

export function messageReceivedEvent(tx: Transaction, args: MessageReceivedEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::message_received_event`,
    arguments: [obj(tx, args.message), pure(tx, args.sequence, `u64`)],
  });
}

export interface MessageSentEventArgs {
  message: TransactionObjectInput;
  sequence: bigint | TransactionArgument;
}

export function messageSentEvent(tx: Transaction, args: MessageSentEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::message_sent_event`,
    arguments: [obj(tx, args.message), pure(tx, args.sequence, `u64`)],
  });
}
