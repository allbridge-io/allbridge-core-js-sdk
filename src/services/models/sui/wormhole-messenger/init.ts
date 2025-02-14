// @ts-nocheck
import * as events from "./events/structs";
import * as wormholeMessenger from "./wormhole-messenger/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(events.MessageReceivedEvent);
  loader.register(events.MessageSentEvent);
  loader.register(wormholeMessenger.AdminCap);
  loader.register(wormholeMessenger.WormholeMessenger);
}
