// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function getId(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_id`,
    arguments: [obj(tx, messenger)],
  });
}

export function getVersion(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_version`,
    arguments: [],
  });
}

export function init(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::init`,
    arguments: [],
  });
}

export interface MigrateArgs {
  admin: TransactionObjectInput;
  messenger: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::migrate`,
    arguments: [obj(tx, args.admin), obj(tx, args.messenger)],
  });
}

export function gasBalanceValue(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::gas_balance_value`,
    arguments: [obj(tx, messenger)],
  });
}

export function getGasUsage(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_gas_usage`,
    arguments: [obj(tx, messenger)],
  });
}

export function getOtherChainIds(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_other_chain_ids`,
    arguments: [obj(tx, messenger)],
  });
}

export function getReceivedMessages(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_received_messages`,
    arguments: [obj(tx, messenger)],
  });
}

export function getSentMessages(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::get_sent_messages`,
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
    target: `${PUBLISHED_AT}::messenger::get_transaction_cost`,
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
    target: `${PUBLISHED_AT}::messenger::receive_message`,
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
    target: `${PUBLISHED_AT}::messenger::send_message`,
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
  messenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::set_gas_usage`,
    arguments: [obj(tx, args.messenger), pure(tx, args.chainId, `u8`), pure(tx, args.gasAmount, `u64`)],
  });
}

export interface SetOtherChainsArgs {
  messenger: TransactionObjectInput;
  otherChainIds: Array<boolean | TransactionArgument> | TransactionArgument;
}

export function setOtherChains(tx: Transaction, args: SetOtherChainsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::set_other_chains`,
    arguments: [obj(tx, args.messenger), pure(tx, args.otherChainIds, `vector<bool>`)],
  });
}

export interface WithdrawFeeArgs {
  messenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::withdraw_fee`,
    arguments: [obj(tx, args.messenger), pure(tx, args.amount, `u64`)],
  });
}

export interface AddSecondaryValidatorArgs {
  messenger: TransactionObjectInput;
  secondaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function addSecondaryValidator(tx: Transaction, args: AddSecondaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::add_secondary_validator`,
    arguments: [obj(tx, args.messenger), pure(tx, args.secondaryValidator, `vector<u8>`)],
  });
}

export interface RemoveSecondaryValidatorArgs {
  messenger: TransactionObjectInput;
  secondaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function removeSecondaryValidator(tx: Transaction, args: RemoveSecondaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::remove_secondary_validator`,
    arguments: [obj(tx, args.messenger), pure(tx, args.secondaryValidator, `vector<u8>`)],
  });
}

export interface SetPrimaryValidatorArgs {
  messenger: TransactionObjectInput;
  primaryValidator: Array<number | TransactionArgument> | TransactionArgument;
}

export function setPrimaryValidator(tx: Transaction, args: SetPrimaryValidatorArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::messenger::set_primary_validator`,
    arguments: [obj(tx, args.messenger), pure(tx, args.primaryValidator, `vector<u8>`)],
  });
}
