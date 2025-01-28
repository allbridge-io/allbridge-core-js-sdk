// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj } from "../../_framework/util";
import { Transaction, TransactionObjectInput } from "@mysten/sui/transactions";

export function wormhole(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_protocol::wormhole`,
    arguments: [],
  });
}

export function allbridge(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_protocol::allbridge`,
    arguments: [],
  });
}

export function id(tx: Transaction, messengerProtocol: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_protocol::id`,
    arguments: [obj(tx, messengerProtocol)],
  });
}
