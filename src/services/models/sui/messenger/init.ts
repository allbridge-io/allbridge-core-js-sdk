// @ts-nocheck
import * as events from "./events/structs";
import * as messenger from "./messenger/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(events.MessageReceivedEvent);
  loader.register(events.MessageSentEvent);
  loader.register(messenger.AdminCap);
  loader.register(messenger.Messenger);
}
