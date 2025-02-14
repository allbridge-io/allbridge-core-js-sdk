// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface BridgeArgs {
  cctpBridge: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  tokenMessengerMinterState: TransactionObjectInput;
  messageTransmitterState: TransactionObjectInput;
  treasury: TransactionObjectInput;
  denyList: TransactionObjectInput;
  amount: TransactionObjectInput;
  feeSuiCoin: TransactionObjectInput;
  feeTokenCoin: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  recipient: TransactionObjectInput;
  recipientWalletAddress: TransactionObjectInput;
}

export function bridge(tx: Transaction, typeArg: string, args: BridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::bridge`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.cctpBridge),
      obj(tx, args.gasOracle),
      obj(tx, args.tokenMessengerMinterState),
      obj(tx, args.messageTransmitterState),
      obj(tx, args.treasury),
      obj(tx, args.denyList),
      obj(tx, args.amount),
      obj(tx, args.feeSuiCoin),
      obj(tx, args.feeTokenCoin),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.recipient),
      obj(tx, args.recipientWalletAddress),
    ],
  });
}

export interface MigrateArgs {
  admin: TransactionObjectInput;
  messenger: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::migrate`,
    arguments: [obj(tx, args.admin), obj(tx, args.messenger)],
  });
}

export interface GetTransactionCostArgs {
  cctpBridge: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getTransactionCost(tx: Transaction, args: GetTransactionCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::get_transaction_cost`,
    arguments: [obj(tx, args.cctpBridge), obj(tx, args.gasOracle), pure(tx, args.chainId, `u8`)],
  });
}

export interface SetGasUsageArgs {
  adminCap: TransactionObjectInput;
  cctpBridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  value: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::set_gas_usage`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.cctpBridge),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.value, `u64`),
    ],
  });
}

export interface WithdrawFeeArgs {
  adminCap: TransactionObjectInput;
  cctpBridge: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, typeArg: string, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::withdraw_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.cctpBridge), pure(tx, args.amount, `u64`)],
  });
}

export interface GasUsageArgs {
  cctpBridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function gasUsage(tx: Transaction, args: GasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::gas_usage`,
    arguments: [obj(tx, args.cctpBridge), pure(tx, args.chainId, `u8`)],
  });
}

export function feeValue(tx: Transaction, typeArg: string, cctpBridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::fee_value`,
    typeArguments: [typeArg],
    arguments: [obj(tx, cctpBridge)],
  });
}

export interface ReceiveTokensArgs {
  tokenMessengerMinterState: TransactionObjectInput;
  messageTransmitterState: TransactionObjectInput;
  denyList: TransactionObjectInput;
  treasury: TransactionObjectInput;
  recipient: string | TransactionArgument;
  message: Array<number | TransactionArgument> | TransactionArgument;
  signature: Array<number | TransactionArgument> | TransactionArgument;
  extraGasCoin: TransactionObjectInput;
}

export function receiveTokens(tx: Transaction, typeArg: string, args: ReceiveTokensArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::receive_tokens`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.tokenMessengerMinterState),
      obj(tx, args.messageTransmitterState),
      obj(tx, args.denyList),
      obj(tx, args.treasury),
      pure(tx, args.recipient, `address`),
      pure(tx, args.message, `vector<u8>`),
      pure(tx, args.signature, `vector<u8>`),
      obj(tx, args.extraGasCoin),
    ],
  });
}

export interface ChangeRecipientArgs {
  cctpBridge: TransactionObjectInput;
  originalMessage: Array<number | TransactionArgument> | TransactionArgument;
  originalAttestation: Array<number | TransactionArgument> | TransactionArgument;
  newRecipient: TransactionObjectInput;
  tokenMessengerMinterState: TransactionObjectInput;
  messageTransmitterState: TransactionObjectInput;
}

export function changeRecipient(tx: Transaction, typeArg: string, args: ChangeRecipientArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::change_recipient`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.cctpBridge),
      pure(tx, args.originalMessage, `vector<u8>`),
      pure(tx, args.originalAttestation, `vector<u8>`),
      obj(tx, args.newRecipient),
      obj(tx, args.tokenMessengerMinterState),
      obj(tx, args.messageTransmitterState),
    ],
  });
}

export interface GetBridgingCostInTokensArgs {
  cctpBridge: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getBridgingCostInTokens(tx: Transaction, args: GetBridgingCostInTokensArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::get_bridging_cost_in_tokens`,
    arguments: [obj(tx, args.cctpBridge), obj(tx, args.gasOracle), pure(tx, args.chainId, `u8`)],
  });
}

export interface GetDomainByChainIdArgs {
  cctpBridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getDomainByChainId(tx: Transaction, args: GetDomainByChainIdArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::get_domain_by_chain_id`,
    arguments: [obj(tx, args.cctpBridge), pure(tx, args.chainId, `u8`)],
  });
}

export interface IsMessageProcessedArgs {
  cctpBridge: TransactionObjectInput;
  messageTransmitterState: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  nonce: bigint | TransactionArgument;
}

export function isMessageProcessed(tx: Transaction, args: IsMessageProcessedArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::is_message_processed`,
    arguments: [
      obj(tx, args.cctpBridge),
      obj(tx, args.messageTransmitterState),
      pure(tx, args.sourceChainId, `u8`),
      pure(tx, args.nonce, `u64`),
    ],
  });
}

export interface RegisterBridgeDestinationArgs {
  adminCap: TransactionObjectInput;
  cctpBridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  domain: number | TransactionArgument;
}

export function registerBridgeDestination(tx: Transaction, args: RegisterBridgeDestinationArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::register_bridge_destination`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.cctpBridge),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.domain, `u32`),
    ],
  });
}

export interface SetAdminFeeShareArgs {
  adminCap: TransactionObjectInput;
  cctpBridge: TransactionObjectInput;
  adminFeeShareBp: bigint | TransactionArgument;
}

export function setAdminFeeShare(tx: Transaction, args: SetAdminFeeShareArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::set_admin_fee_share`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.cctpBridge), pure(tx, args.adminFeeShareBp, `u64`)],
  });
}

export interface UnregisterBridgeDestinationArgs {
  adminCap: TransactionObjectInput;
  cctpBridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function unregisterBridgeDestination(tx: Transaction, args: UnregisterBridgeDestinationArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::cctp_bridge_interface::unregister_bridge_destination`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.cctpBridge), pure(tx, args.chainId, `u8`)],
  });
}
