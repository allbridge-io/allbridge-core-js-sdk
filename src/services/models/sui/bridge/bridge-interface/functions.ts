// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import { Transaction, TransactionArgument, TransactionObjectInput } from "@mysten/sui/transactions";

export function destroyEmpty(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::destroy_empty`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export interface SwapArgs {
  bridge: TransactionObjectInput;
  coin: TransactionObjectInput;
  receiveAmountMin: bigint | TransactionArgument;
}

export function swap(tx: Transaction, typeArgs: [string, string], args: SwapArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::swap`,
    typeArguments: typeArgs,
    arguments: [obj(tx, args.bridge), obj(tx, args.coin), pure(tx, args.receiveAmountMin, `u64`)],
  });
}

export interface DepositArgs {
  bridge: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function deposit(tx: Transaction, typeArg: string, args: DepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.userDeposit), obj(tx, args.coin)],
  });
}

export interface WithdrawArgs {
  bridge: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
  amountLp: bigint | TransactionArgument;
}

export function withdraw(tx: Transaction, typeArg: string, args: WithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.userDeposit), pure(tx, args.amountLp, `u64`)],
  });
}

export interface DepositFeeArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  coin: TransactionObjectInput;
}

export function depositFee(tx: Transaction, typeArg: string, args: DepositFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::deposit_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), obj(tx, args.coin)],
  });
}

export interface MigrateArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function migrate(tx: Transaction, args: MigrateArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::migrate`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface SetGasUsageArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  value: bigint | TransactionArgument;
}

export function setGasUsage(tx: Transaction, args: SetGasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::set_gas_usage`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.bridge),
      pure(tx, args.chainId, `u8`),
      pure(tx, args.value, `u64`),
    ],
  });
}

export interface WithdrawFeeArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function withdrawFee(tx: Transaction, typeArg: string, args: WithdrawFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::withdraw_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.amount, `u64`)],
  });
}

export interface GasUsageArgs {
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function gasUsage(tx: Transaction, args: GasUsageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::gas_usage`,
    arguments: [obj(tx, args.bridge), pure(tx, args.chainId, `u8`)],
  });
}

export function lpAmount(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::lp_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export function rewardDebt(tx: Transaction, typeArg: string, userDeposit: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::reward_debt`,
    typeArguments: [typeArg],
    arguments: [obj(tx, userDeposit)],
  });
}

export interface ClaimAdminFeeArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function claimAdminFee(tx: Transaction, typeArg: string, args: ClaimAdminFeeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::claim_admin_fee`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface ClaimRewardArgs {
  bridge: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function claimReward(tx: Transaction, typeArg: string, args: ClaimRewardArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::claim_reward`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.userDeposit)],
  });
}

export interface SetAdminFeeShareBpArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  adminFeeShareBp: bigint | TransactionArgument;
}

export function setAdminFeeShareBp(tx: Transaction, typeArg: string, args: SetAdminFeeShareBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::set_admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.adminFeeShareBp, `u64`)],
  });
}

export function adminFeeShareBp(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::admin_fee_share_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface SetBalanceRatioMinBpArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  balanceRatioMinBp: bigint | TransactionArgument;
}

export function setBalanceRatioMinBp(tx: Transaction, typeArg: string, args: SetBalanceRatioMinBpArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::set_balance_ratio_min_bp`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.balanceRatioMinBp, `u64`)],
  });
}

export function pool(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface AdjustTotalLpAmountArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function adjustTotalLpAmount(tx: Transaction, typeArg: string, args: AdjustTotalLpAmountArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::adjust_total_lp_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), obj(tx, args.userDeposit)],
  });
}

export function canDeposit(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::can_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function canWithdraw(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::can_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function feeShare(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::fee_share`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface SetFeeShareArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  feeShareBp: bigint | TransactionArgument;
}

export function setFeeShare(tx: Transaction, typeArg: string, args: SetFeeShareArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::set_fee_share`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.feeShareBp, `u64`)],
  });
}

export interface StartDepositArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function startDeposit(tx: Transaction, typeArg: string, args: StartDepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::start_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface StartWithdrawArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function startWithdraw(tx: Transaction, typeArg: string, args: StartWithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::start_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface StopDepositArgs {
  stopCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function stopDeposit(tx: Transaction, typeArg: string, args: StopDepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::stop_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.stopCap), obj(tx, args.bridge)],
  });
}

export interface StopWithdrawArgs {
  stopCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function stopWithdraw(tx: Transaction, typeArg: string, args: StopWithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::stop_withdraw`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.stopCap), obj(tx, args.bridge)],
  });
}

export interface AddBridgeArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  bridgeAddress: TransactionObjectInput;
}

export function addBridge(tx: Transaction, args: AddBridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::add_bridge`,
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.bridge),
      pure(tx, args.chainId, `u8`),
      obj(tx, args.bridgeAddress),
    ],
  });
}

export interface AddBridgeTokenArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  tokenAddress: TransactionObjectInput;
}

export function addBridgeToken(tx: Transaction, args: AddBridgeTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::add_bridge_token`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.chainId, `u8`), obj(tx, args.tokenAddress)],
  });
}

export interface AddPoolArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  pool: TransactionObjectInput;
}

export function addPool(tx: Transaction, typeArg: string, args: AddPoolArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::add_pool`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), obj(tx, args.pool)],
  });
}

export function canSwap(tx: Transaction, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::can_swap`,
    arguments: [obj(tx, bridge)],
  });
}

export function feeValue(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::fee_value`,
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
    target: `${PUBLISHED_AT}::bridge_interface::get_bridge_allbridge_cost`,
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
    target: `${PUBLISHED_AT}::bridge_interface::get_bridge_cost`,
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
    target: `${PUBLISHED_AT}::bridge_interface::get_bridge_wormhole_cost`,
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.gasOracle),
      pure(tx, args.chainId, `u8`),
    ],
  });
}

export interface IsProcessedMessageArgs {
  bridge: TransactionObjectInput;
  message: TransactionObjectInput;
}

export function isProcessedMessage(tx: Transaction, args: IsProcessedMessageArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::is_processed_message`,
    arguments: [obj(tx, args.bridge), obj(tx, args.message)],
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
    target: `${PUBLISHED_AT}::bridge_interface::receive_tokens_wormhole`,
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
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
}

export function removeBridge(tx: Transaction, args: RemoveBridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::remove_bridge`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.chainId, `u8`)],
  });
}

export interface RemoveBridgeTokenArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  chainId: number | TransactionArgument;
  tokenAddress: TransactionObjectInput;
}

export function removeBridgeToken(tx: Transaction, args: RemoveBridgeTokenArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::remove_bridge_token`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.chainId, `u8`), obj(tx, args.tokenAddress)],
  });
}

export interface SetRebalancerArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
  rebalancer: string | TransactionArgument;
}

export function setRebalancer(tx: Transaction, args: SetRebalancerArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::set_rebalancer`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge), pure(tx, args.rebalancer, `address`)],
  });
}

export interface StartSwapArgs {
  adminCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function startSwap(tx: Transaction, args: StartSwapArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::start_swap`,
    arguments: [obj(tx, args.adminCap), obj(tx, args.bridge)],
  });
}

export interface StopSwapArgs {
  stopSwapCap: TransactionObjectInput;
  bridge: TransactionObjectInput;
}

export function stopSwap(tx: Transaction, args: StopSwapArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::stop_swap`,
    arguments: [obj(tx, args.stopSwapCap), obj(tx, args.bridge)],
  });
}

export interface SwapAndBridgeWormholeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  wormholeState: TransactionObjectInput;
  theClock: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  amount: TransactionObjectInput;
  recipient: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  feeSuiCoin: TransactionObjectInput;
  feeTokenCoin: TransactionObjectInput;
}

export function swapAndBridgeWormhole(tx: Transaction, typeArg: string, args: SwapAndBridgeWormholeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::swap_and_bridge_wormhole`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.wormholeState),
      obj(tx, args.theClock),
      obj(tx, args.gasOracle),
      obj(tx, args.amount),
      obj(tx, args.recipient),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.feeSuiCoin),
      obj(tx, args.feeTokenCoin),
    ],
  });
}

export interface NewPoolArgs {
  adminCap: TransactionObjectInput;
  coinMetadata: TransactionObjectInput;
  a: bigint | TransactionArgument;
  feeShareBp: bigint | TransactionArgument;
}

export function newPool(tx: Transaction, typeArg: string, args: NewPoolArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::new_pool`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.adminCap),
      obj(tx, args.coinMetadata),
      pure(tx, args.a, `u64`),
      pure(tx, args.feeShareBp, `u64`),
    ],
  });
}

export function newUserDeposit(tx: Transaction, typeArg: string) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::new_user_deposit`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export function poolA(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_a`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function poolBalance(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function poolD(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_d`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function poolDecimals(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_decimals`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function poolLpSupply(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_lp_supply`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface PoolPendingRewardsArgs {
  bridge: TransactionObjectInput;
  userDeposit: TransactionObjectInput;
}

export function poolPendingRewards(tx: Transaction, typeArg: string, args: PoolPendingRewardsArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_pending_rewards`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.bridge), obj(tx, args.userDeposit)],
  });
}

export function poolTokenBalance(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_token_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export function poolVusdBalance(tx: Transaction, typeArg: string, bridge: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::pool_vusd_balance`,
    typeArguments: [typeArg],
    arguments: [obj(tx, bridge)],
  });
}

export interface ReceiveTokensArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  amount: bigint | TransactionArgument;
  recipient: TransactionObjectInput;
  sourceChainId: number | TransactionArgument;
  nonce: bigint | TransactionArgument;
  receiveAmountMin: bigint | TransactionArgument;
  extraGasCoin: TransactionObjectInput;
}

export function receiveTokens(tx: Transaction, typeArg: string, args: ReceiveTokensArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::receive_tokens`,
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

export interface SwapAndBridgeArgs {
  bridge: TransactionObjectInput;
  messenger: TransactionObjectInput;
  gasOracle: TransactionObjectInput;
  amount: TransactionObjectInput;
  recipient: TransactionObjectInput;
  destinationChainId: number | TransactionArgument;
  receiveToken: TransactionObjectInput;
  nonce: bigint | TransactionArgument;
  feeSuiCoin: TransactionObjectInput;
  feeTokenCoin: TransactionObjectInput;
}

export function swapAndBridge(tx: Transaction, typeArg: string, args: SwapAndBridgeArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::bridge_interface::swap_and_bridge`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.bridge),
      obj(tx, args.messenger),
      obj(tx, args.gasOracle),
      obj(tx, args.amount),
      obj(tx, args.recipient),
      pure(tx, args.destinationChainId, `u8`),
      obj(tx, args.receiveToken),
      pure(tx, args.nonce, `u256`),
      obj(tx, args.feeSuiCoin),
      obj(tx, args.feeTokenCoin),
    ],
  });
}
