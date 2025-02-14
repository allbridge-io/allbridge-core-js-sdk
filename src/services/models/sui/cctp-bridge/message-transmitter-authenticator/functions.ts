// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { Transaction } from "@mysten/sui/transactions";

export function new_(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message_transmitter_authenticator::new`,
    arguments: [],
  });
}
