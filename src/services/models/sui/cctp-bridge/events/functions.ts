// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface ReceiveFeeEventArgs {
  userPaySui: bigint | TransactionArgument;
  userPayStable: bigint | TransactionArgument;
  totalPaySui: bigint | TransactionArgument;
  totalFeeSui: bigint | TransactionArgument;
}

export function receiveFeeEvent(tx: Transaction, args: ReceiveFeeEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::receive_fee_event`,
    arguments: [
      pure(tx, args.userPaySui, `u64`),
      pure(tx, args.userPayStable, `u64`),
      pure(tx, args.totalPaySui, `u64`),
      pure(tx, args.totalFeeSui, `u64`),
    ],
  });
}

export interface TokensReceivedEventArgs {
  recipient: string | TransactionArgument;
  message: Array<number | TransactionArgument> | TransactionArgument;
  extraGasValue: bigint | TransactionArgument;
}

export function tokensReceivedEvent(tx: Transaction, typeArg: string, args: TokensReceivedEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::tokens_received_event`,
    typeArguments: [typeArg],
    arguments: [
      pure(tx, args.recipient, `address`),
      pure(tx, args.message, `vector<u8>`),
      pure(tx, args.extraGasValue, `u64`),
    ],
  });
}

export interface TokensSentEventArgs {
  amount: bigint | TransactionArgument;
  adminFee: bigint | TransactionArgument;
  sender: string | TransactionArgument;
  recipient: TransactionObjectInput;
  recipientWalletAddress: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  nonce: bigint | TransactionArgument;
}

export function tokensSentEvent(tx: Transaction, typeArg: string, args: TokensSentEventArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::tokens_sent_event`,
    typeArguments: [typeArg],
    arguments: [
      pure(tx, args.amount, `u64`),
      pure(tx, args.adminFee, `u64`),
      pure(tx, args.sender, `address`),
      obj(tx, args.recipient),
      obj(tx, args.recipientWalletAddress),
      pure(tx, args.destinationChainId, `u8`),
      pure(tx, args.nonce, `u64`),
    ],
  });
}

export interface RecipientReplacedArgs {
  sender: string | TransactionArgument;
  nonce: bigint | TransactionArgument;
  newRecipitne: TransactionObjectInput;
}

export function recipientReplaced(tx: Transaction, typeArg: string, args: RecipientReplacedArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::events::recipient_replaced`,
    typeArguments: [typeArg],
    arguments: [pure(tx, args.sender, `address`), pure(tx, args.nonce, `u64`), obj(tx, args.newRecipitne)],
  });
}
