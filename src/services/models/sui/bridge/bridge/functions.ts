// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export interface SwapArgs {
  bridge: TransactionObjectInput;
  coin: TransactionObjectInput;
  receiveAmountMin: bigint | TransactionArgument;
}

export function swap(tx: Transaction, typeArgs: [string, string], args: SwapArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::swap`,
    typeArguments: typeArgs,
    arguments: [obj(tx, args.bridge), obj(tx, args.coin), pure(tx, args.receiveAmountMin, `u64`)],
  });
}

export interface DepositFeeArgs {
  bridge: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function depositFee(tx: Transaction, typeArg: string, args: DepositFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::deposit_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.coin)],
  });
}

export function getId(tx: Transaction, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_id`,
    arguments: [obj(tx, bridge)],
  });
}

export function getVersion(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_version`,
    arguments: [],
  });
}

export function init(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::init`,
    arguments: [],
  });
}

export interface MigrateArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::migrate`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface SetGasUsageArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  value: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::set_gas_usage`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`), pure(tx, args.value, `u64`)],
  });
}

export interface WithdrawFeeArgs {
  bridge: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, typeArg: string, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::withdraw_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), pure(tx, args.amount, `u64`)],
  });
}

export interface GasUsageArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function gasUsage(tx: Transaction, args: GasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::gas_usage`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`)],
  });
}

export function adminFeeShareBp(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function pool(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::pool`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface AddBridgeArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  bridgeAddress: TransactionObjectInput;
}

export function addBridge(tx: Transaction, args: AddBridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::add_bridge`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`), obj(tx, args.bridgeAddress)],
  });
}

export interface AddBridgeTokenArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  tokenAddress: TransactionObjectInput;
}

export function addBridgeToken(tx: Transaction, args: AddBridgeTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::add_bridge_token`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`), obj(tx, args.tokenAddress)],
  });
}

export interface AddPoolArgs {
  bridge: TransactionObjectInput;
  pool: TransactionObjectInput;
}

export function addPool(tx: Transaction, typeArg: string, args: AddPoolArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::add_pool`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.pool)],
  });
}

export function canSwap(tx: Transaction, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::can_swap`,
    arguments: [obj(tx, bridge)],
  });
}

export function feeValue(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::fee_value`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface GetBridgeAllbridgeCostArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getBridgeAllbridgeCost(tx: Transaction, args: GetBridgeAllbridgeCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_bridge_allbridge_cost`,
    arguments: [obj(tx, args.bridge), obj(tx, args.messenger), obj(tx, args.gasOracle), pure(tx, args.chainId, `u8`)],
  });
}

export interface GetBridgeCostArgs {
  bridge: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getBridgeCost(tx: Transaction, args: GetBridgeCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_bridge_cost`,
    arguments: [obj(tx, args.bridge), obj(tx, args.gasOracle), pure(tx, args.chainId, `u8`)],
  });
}

export interface GetBridgeWormholeCostArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function getBridgeWormholeCost(tx: Transaction, args: GetBridgeWormholeCostArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_bridge_wormhole_cost`,
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.gasOracle),
      pure(tx, args.chainId, `u8`),
    ],
  });
}

export function getPoolKey(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::get_pool_key`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export interface IsProcessedMessageArgs {
  bridge: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function isProcessedMessage(tx: Transaction, args: IsProcessedMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::is_processed_message`,
    arguments: [obj(tx, args.bridge), obj(tx, args.message)],
  });
}

export function poolMut(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::pool_mut`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface ReceiveTokensAllbridgeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
  recipient: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  nonce: bigint | TransactionArgument;
  receiveAmountMin: bigint | TransactionArgument;
  extraGasCoin: TransactionObjectInput;
}

export function receiveTokensAllbridge(tx: Transaction, typeArg: string, args: ReceiveTokensAllbridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::receive_tokens_allbridge`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      pure(tx, args.amount, `u64`),
      obj(tx, args.recipient),
      pure(tx, args.sourceChainId, `u8`),
      pure(tx, args.nonce, `u256`),
      pure(tx, args.receiveAmountMin, `u64`),
      obj(tx, args.extraGasCoin),
    ],
  });
}

export interface ReceiveTokensWormholeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
  recipient: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  nonce: bigint | TransactionArgument;
  receiveAmountMin: bigint | TransactionArgument;
  extraGasCoin: TransactionObjectInput;
}

export function receiveTokensWormhole(tx: Transaction, typeArg: string, args: ReceiveTokensWormholeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::receive_tokens_wormhole`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      pure(tx, args.amount, `u64`),
      obj(tx, args.recipient),
      pure(tx, args.sourceChainId, `u8`),
      pure(tx, args.nonce, `u256`),
      pure(tx, args.receiveAmountMin, `u64`),
      obj(tx, args.extraGasCoin),
    ],
  });
}

export interface RemoveBridgeArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function removeBridge(tx: Transaction, args: RemoveBridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::remove_bridge`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`)],
  });
}

export interface RemoveBridgeTokenArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  tokenAddress: TransactionObjectInput;
}

export function removeBridgeToken(tx: Transaction, args: RemoveBridgeTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::remove_bridge_token`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`), obj(tx, args.tokenAddress)],
  });
}

export interface SetRebalancerArgs {
  bridge: TransactionObjectInput;
  rebalancer: string | TransactionArgument;
}

export function setRebalancer(tx: Transaction, args: SetRebalancerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::set_rebalancer`,
    arguments: [obj(tx, args.bridge), pure(tx, args.rebalancer, `address`)],
  });
}

export function startSwap(tx: Transaction, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::start_swap`,
    arguments: [obj(tx, bridge)],
  });
}

export function stopSwap(tx: Transaction, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::stop_swap`,
    arguments: [obj(tx, bridge)],
  });
}

export interface SwapAndBridgeAllbridgeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  coin: TransactionObjectInput;
  recipient: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  feeSuiCoin: TransactionObjectInput;
  feeTokenCoin: TransactionObjectInput;
}

export function swapAndBridgeAllbridge(tx: Transaction, typeArg: string, args: SwapAndBridgeAllbridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::swap_and_bridge_allbridge`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.gasOracle),
      obj(tx, args.coin),
      obj(tx, args.recipient),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.feeSuiCoin),
      obj(tx, args.feeTokenCoin),
    ],
  });
}

export interface SwapAndBridgeWormholeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
  theClock: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  coin: TransactionObjectInput;
  recipient: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  feeSuiCoin: TransactionObjectInput;
  feeTokenCoin: TransactionObjectInput;
}

export function swapAndBridgeWormhole(tx: Transaction, typeArg: string, args: SwapAndBridgeWormholeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge::swap_and_bridge_wormhole`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.theClock),
      obj(tx, args.gasOracle),
      obj(tx, args.coin),
      obj(tx, args.recipient),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.feeSuiCoin),
      obj(tx, args.feeTokenCoin),
    ],
  });
}
