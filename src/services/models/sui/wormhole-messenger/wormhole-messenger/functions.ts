// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function getId(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_id`,
    arguments: [obj(tx, messenger)],
  });
}

export function getVersion(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_version`,
    arguments: [],
  });
}

export function init(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::init`,
    arguments: [],
  });
}

export interface MigrateArgs {
  adminCap: TransactionObjectInput;
  wormholeMessenger: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::migrate`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.wormholeMessenger)],
  });
}

export function gasBalanceValue(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::gas_balance_value`,
    arguments: [obj(tx, messenger)],
  });
}

export function getGasUsage(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_gas_usage`,
    arguments: [obj(tx, messenger)],
  });
}

export function getOtherChainIds(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_other_chain_ids`,
    arguments: [obj(tx, messenger)],
  });
}

export function getOtherWormholeMessengers(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_other_wormhole_messengers`,
    arguments: [obj(tx, messenger)],
  });
}

export function getReceivedMessages(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_received_messages`,
    arguments: [obj(tx, messenger)],
  });
}

export function getSentMessages(tx: Transaction, messenger: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::get_sent_messages`,
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
    target: `${PUBLISHED_AT}::wormhole_messenger::get_transaction_cost`,
    arguments: [
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.gasOracle),
      pure(tx, args.chainId, `u8`),
    ],
  });
}

export interface InitEmitterArgs {
  whMessenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
}

export function initEmitter(tx: Transaction, args: InitEmitterArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::init_emitter`,
    arguments: [obj(tx, args.whMessenger), obj(tx, args.wormholeState)],
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
    target: `${PUBLISHED_AT}::wormhole_messenger::receive_message`,
    arguments: [
      obj(tx, args.whMessenger),
      pure(tx, args.encodedMsg, `vector<u8>`),
      obj(tx, args.wormholeState),
      obj(tx, args.theClock),
    ],
  });
}

export interface ReceiveMessageInnerArgs {
  whMessenger: TransactionObjectInput;
  sequence: bigint | TransactionArgument;
  emitterChainId: number | TransactionArgument;
  emitterAddress: TransactionObjectInput;
  payload: TransactionObjectInput;
}

export function receiveMessageInner(tx: Transaction, args: ReceiveMessageInnerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::receive_message_inner`,
    arguments: [
      obj(tx, args.whMessenger),
      pure(tx, args.sequence, `u64`),
      pure(tx, args.emitterChainId, `u16`),
      obj(tx, args.emitterAddress),
      obj(tx, args.payload),
    ],
  });
}

export interface RegisterWormholeMessengerArgs {
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  whAddress: TransactionObjectInput;
}

export function registerWormholeMessenger(tx: Transaction, args: RegisterWormholeMessengerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::register_wormhole_messenger`,
    arguments: [obj(tx, args.whMessenger), pure(tx, args.chainId, `u16`), obj(tx, args.whAddress)],
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
    target: `${PUBLISHED_AT}::wormhole_messenger::send_message`,
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
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
  gasAmount: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::set_gas_usage`,
    arguments: [obj(tx, args.whMessenger), pure(tx, args.chainId, `u8`), pure(tx, args.gasAmount, `u64`)],
  });
}

export interface SetOtherChainsArgs {
  whMessenger: TransactionObjectInput;
  otherChainIds: Array<boolean | TransactionArgument> | TransactionArgument;
}

export function setOtherChains(tx: Transaction, args: SetOtherChainsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::set_other_chains`,
    arguments: [obj(tx, args.whMessenger), pure(tx, args.otherChainIds, `vector<bool>`)],
  });
}

export interface UnregisterWormholeMessengerArgs {
  whMessenger: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function unregisterWormholeMessenger(tx: Transaction, args: UnregisterWormholeMessengerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::unregister_wormhole_messenger`,
    arguments: [obj(tx, args.whMessenger), pure(tx, args.chainId, `u16`)],
  });
}

export interface WithdrawFeeArgs {
  whMessenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::wormhole_messenger::withdraw_fee`,
    arguments: [obj(tx, args.whMessenger), pure(tx, args.amount, `u64`)],
  });
}
