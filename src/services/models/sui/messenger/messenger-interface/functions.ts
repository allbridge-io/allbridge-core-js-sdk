// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface MigrateArgs {
  admin: TransactionObjectInput;
  messenger: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::migrate`,
    arguments: [obj(tx, args.admin), obj(tx, args.messenger)],
  });
}

export function gasBalanceValue(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::gas_balance_value`,
    arguments: [obj(tx, messenger)],
  });
}

export interface GetGasUsageArgs {
  messenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getGasUsage(tx: Transaction, args: GetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::get_gas_usage`,
    arguments: [obj(tx, args.messenger), pure(tx, args.chainId, `u8`)],
  });
}

export function getOtherChainIds(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::get_other_chain_ids`,
    arguments: [obj(tx, messenger)],
  });
}

export interface GetTransactionCostArgs {
  messenger: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getTransactionCost(tx: Transaction, args: GetTransactionCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::get_transaction_cost`,
    arguments: [obj(tx, args.messenger), obj(tx, args.gasOracle), pure(tx, args.chainId, `u8`)],
  });
}

export interface ReceiveMessageArgs {
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
  signaturePrimary: Array<number | TransactionArgument> | TransactionArgument;
  signatureSecondary: Array<number | TransactionArgument> | TransactionArgument;
}

export function receiveMessage(tx: Transaction, args: ReceiveMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::receive_message`,
    arguments: [
      obj(tx, args.messenger),
      obj(tx, args.message),
      pure(tx, args.signaturePrimary, `vector<u8>`),
      pure(tx, args.signatureSecondary, `vector<u8>`),
    ],
  });
}

export interface SendMessageArgs {
  messenger: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  coin: TransactionObjectInput;
  message: TransactionObjectInput;
  sender: TransactionObjectInput;
}

export function sendMessage(tx: Transaction, args: SendMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::send_message`,
    arguments: [
      obj(tx, args.messenger),
      obj(tx, args.gasOracle),
      obj(tx, args.coin),
      obj(tx, args.message),
      obj(tx, args.sender),
    ],
  });
}

export interface SetGasUsageArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::set_gas_usage`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.messenger),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.gasAmount, `u64`),
    ],
  });
}

export interface SetOtherChainsArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  otherChainIds: Array<boolean | TransactionArgument> | TransactionArgument;
}

export function setOtherChains(tx: Transaction, args: SetOtherChainsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::set_other_chains`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.messenger), pure(tx, args.otherChainIds, `vector<bool>`)],
  });
}

export interface WithdrawFeeArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::withdraw_fee`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.messenger), pure(tx, args.amount, `u64`)],
  });
}

export interface HasReceivedMessageArgs {
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function hasReceivedMessage(tx: Transaction, args: HasReceivedMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::has_received_message`,
    arguments: [obj(tx, args.messenger), obj(tx, args.message)],
  });
}

export interface HasSentMessagesArgs {
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function hasSentMessages(tx: Transaction, args: HasSentMessagesArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::has_sent_messages`,
    arguments: [obj(tx, args.messenger), obj(tx, args.message)],
  });
}

export interface AddSecondaryValidatorArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  secondaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function addSecondaryValidator(tx: Transaction, args: AddSecondaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::add_secondary_validator`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.messenger), pure(tx, args.secondaryValidator, `vector<u8>`)],
  });
}

export interface RemoveSecondaryValidatorArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  secondaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function removeSecondaryValidator(tx: Transaction, args: RemoveSecondaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::remove_secondary_validator`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.messenger), pure(tx, args.secondaryValidator, `vector<u8>`)],
  });
}

export interface SetPrimaryValidatorArgs {
  adminCap: TransactionObjectInput;
  messenger: TransactionObjectInput;
  primaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function setPrimaryValidator(tx: Transaction, args: SetPrimaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger_interface::set_primary_validator`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.messenger), pure(tx, args.primaryValidator, `vector<u8>`)],
  });
}
