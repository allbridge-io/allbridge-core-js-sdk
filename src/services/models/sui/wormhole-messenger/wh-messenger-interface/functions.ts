// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface MigrateArgs {
  adminCap: TransactionObjectInput;
  wormholeMessenger: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::migrate`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.wormholeMessenger)],
  });
}

export function gasBalanceValue(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::gas_balance_value`,
    arguments: [obj(tx, messenger)],
  });
}

export interface GetGasUsageArgs {
  messenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getGasUsage(tx: Transaction, args: GetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::get_gas_usage`,
    arguments: [obj(tx, args.messenger), pure(tx, args.chainId, `u8`)],
  });
}

export function getOtherChainIds(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::get_other_chain_ids`,
    arguments: [obj(tx, messenger)],
  });
}

export interface GetTransactionCostArgs {
  messenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getTransactionCost(tx: Transaction, args: GetTransactionCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::get_transaction_cost`,
    arguments: [
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.gasOracle),
      pure(tx, args.chainId, `u8`),
    ],
  });
}

export interface InitEmitterArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
}

export function initEmitter(tx: Transaction, args: InitEmitterArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::init_emitter`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.whMessenger), obj(tx, args.wormholeState)],
  });
}

export interface ReceiveMessageArgs {
  whMessenger: TransactionObjectInput;
  encodedMsg: Array<number | TransactionArgument> | TransactionArgument;
  wormholeState: TransactionObjectInput;
  theClock: TransactionObjectInput;
}

export function receiveMessage(tx: Transaction, args: ReceiveMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::receive_message`,
    arguments: [
      obj(tx, args.whMessenger),
      pure(tx, args.encodedMsg, `vector<u8>`),
      obj(tx, args.wormholeState),
      obj(tx, args.theClock),
    ],
  });
}

export interface RegisterWormholeMessengerArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  whAddress: TransactionObjectInput;
}

export function registerWormholeMessenger(tx: Transaction, args: RegisterWormholeMessengerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::register_wormhole_messenger`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.whMessenger),
      pure(tx, args.chainId, `u16`),
      obj(tx, args.whAddress),
    ],
  });
}

export interface SendMessageArgs {
  whMessenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  payload: TransactionObjectInput;
  sender: TransactionObjectInput;
  theClock: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function sendMessage(tx: Transaction, args: SendMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::send_message`,
    arguments: [
      obj(tx, args.whMessenger),
      obj(tx, args.wormholeState),
      obj(tx, args.gasOracle),
      obj(tx, args.payload),
      obj(tx, args.sender),
      obj(tx, args.theClock),
      obj(tx, args.coin),
    ],
  });
}

export interface SetGasUsageArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::set_gas_usage`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.whMessenger),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.gasAmount, `u64`),
    ],
  });
}

export interface SetOtherChainsArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  otherChainIds: Array<boolean | TransactionArgument> | TransactionArgument;
}

export function setOtherChains(tx: Transaction, args: SetOtherChainsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::set_other_chains`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.whMessenger), pure(tx, args.otherChainIds, `vector<bool>`)],
  });
}

export interface UnregisterWormholeMessengerArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function unregisterWormholeMessenger(tx: Transaction, args: UnregisterWormholeMessengerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::unregister_wormhole_messenger`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.whMessenger), pure(tx, args.chainId, `u16`)],
  });
}

export interface WithdrawFeeArgs {
  adminCap: TransactionObjectInput;
  whMessenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::withdraw_fee`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.whMessenger), pure(tx, args.amount, `u64`)],
  });
}

export interface HasReceivedMessageArgs {
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function hasReceivedMessage(tx: Transaction, args: HasReceivedMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::has_received_message`,
    arguments: [obj(tx, args.messenger), obj(tx, args.message)],
  });
}

export interface HasSentMessagesArgs {
  messenger: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function hasSentMessages(tx: Transaction, args: HasSentMessagesArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wh_messenger_interface::has_sent_messages`,
    arguments: [obj(tx, args.messenger), obj(tx, args.message)],
  });
}
