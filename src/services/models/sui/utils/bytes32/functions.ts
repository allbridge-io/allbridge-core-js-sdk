// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { String } from "../../_dependencies/source/0x1/ascii/structs";
import { String as String1 } from "../../_dependencies/source/0x1/string/structs";
import { obj, pure } from "../../_framework/util";
import { ID } from "../../sui/object/structs";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function isZero(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::is_zero`,
    arguments: [obj(tx, bytes)],
  });
}

export function data(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::data`,
    arguments: [obj(tx, bytes)],
  });
}

export function empty(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::empty`,
    arguments: [],
  });
}

export function new_(tx: Transaction, data: Array<number | TransactionArgument> | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::new`,
    arguments: [pure(tx, data, `vector<u8>`)],
  });
}

export function fromAddress(tx: Transaction, a: string | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::from_address`,
    arguments: [pure(tx, a, `address`)],
  });
}

export function fromAsciiHex(tx: Transaction, value: string | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::from_ascii_hex`,
    arguments: [pure(tx, value, `${String.$typeName}`)],
  });
}

export function fromHex(tx: Transaction, value: string | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::from_hex`,
    arguments: [pure(tx, value, `${String1.$typeName}`)],
  });
}

export function fromId(tx: Transaction, id: string | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::from_id`,
    arguments: [pure(tx, id, `${ID.$typeName}`)],
  });
}

export function fromUid(tx: Transaction, id: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::from_uid`,
    arguments: [obj(tx, id)],
  });
}

export function newFromPartial(
  tx: Transaction,
  partialData: Array<number | TransactionArgument> | TransactionArgument
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::new_from_partial`,
    arguments: [pure(tx, partialData, `vector<u8>`)],
  });
}

export function toAddress(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::to_address`,
    arguments: [obj(tx, bytes)],
  });
}

export function toAsciiHex(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::to_ascii_hex`,
    arguments: [obj(tx, bytes)],
  });
}

export function toHex(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::to_hex`,
    arguments: [obj(tx, bytes)],
  });
}

export function toId(tx: Transaction, bytes: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bytes32::to_id`,
    arguments: [obj(tx, bytes)],
  });
}
