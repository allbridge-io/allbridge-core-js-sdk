// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { ID } from "../../sui/object/structs";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function data(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::data`,
    arguments: [obj(tx, message)],
  });
}

export function fromBytes(tx: Transaction, message: Array<number | TransactionArgument> | TransactionArgument) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::from_bytes`,
    arguments: [pure(tx, message, `vector<u8>`)],
  });
}

export function new_(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::new`,
    arguments: [obj(tx, message)],
  });
}

export function toHex(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::to_hex`,
    arguments: [obj(tx, message)],
  });
}

export interface AddSenderArgs {
  message: TransactionObjectInput;
  sender: string | TransactionArgument;
}

export function addSender(tx: Transaction, args: AddSenderArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::add_sender`,
    arguments: [obj(tx, args.message), pure(tx, args.sender, `${ID.$typeName}`)],
  });
}

export function chainFrom(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::chain_from`,
    arguments: [obj(tx, message)],
  });
}

export function chainTo(tx: Transaction, message: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::chain_to`,
    arguments: [obj(tx, message)],
  });
}

export interface FromArgsArgs {
  amount: bigint | TransactionArgument;
  recipient: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  messenger: TransactionObjectInput;
}

export function fromArgs(tx: Transaction, args: FromArgsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::from_args`,
    arguments: [
      pure(tx, args.amount, `u64`),
      obj(tx, args.recipient),
      pure(tx, args.sourceChainId, `u8`),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.messenger),
    ],
  });
}

export interface FromArgsWithSenderArgs {
  amount: bigint | TransactionArgument;
  recipient: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  messenger: TransactionObjectInput;
  sender: string | TransactionArgument;
}

export function fromArgsWithSender(tx: Transaction, args: FromArgsWithSenderArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::message::from_args_with_sender`,
    arguments: [
      pure(tx, args.amount, `u64`),
      obj(tx, args.recipient),
      pure(tx, args.sourceChainId, `u8`),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.messenger),
      pure(tx, args.sender, `${ID.$typeName}`),
    ],
  });
}
