// @ts-nocheck
import * as anotherBridge from "./another-bridge/structs";
import * as bridge from "./bridge/structs";
import * as events from "./events/structs";
import * as poolRewards from "./pool-rewards/structs";
import * as poolState from "./pool-state/structs";
import * as pool from "./pool/structs";
import * as userDeposit from "./user-deposit/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(anotherBridge.AnotherBridge);
  loader.register(userDeposit.UserDeposit);
  loader.register(poolRewards.PoolRewards);
  loader.register(poolState.PoolState);
  loader.register(events.DepositEvent);
  loader.register(events.ReceiveFeeEvent);
  loader.register(events.RewardsClaimedEvent);
  loader.register(events.SwappedEvent);
  loader.register(events.SwappedFromVUsdEvent);
  loader.register(events.SwappedToVUsdEvent);
  loader.register(events.TokensReceivedEvent);
  loader.register(events.TokensSentEvent);
  loader.register(events.WithdrawEvent);
  loader.register(pool.AdminCap);
  loader.register(pool.Pool);
  loader.register(pool.StopCap);
  loader.register(bridge.AdminCap);
  loader.register(bridge.Bridge);
  loader.register(bridge.FeeCollectorCap);
  loader.register(bridge.StopSwapCap);
}
