// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj } from "../../_framework/util";
import { Transaction, TransactionObjectInput } from "@mysten/sui/transactions";

export function messageReceivedEvent(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::message_received_event`,
    arguments: [obj(tx, message)],
  });
}

export function messageSentEvent(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::message_sent_event`,
    arguments: [obj(tx, message)],
  });
}
