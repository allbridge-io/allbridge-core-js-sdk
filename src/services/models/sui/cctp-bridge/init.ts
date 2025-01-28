// @ts-nocheck
import * as cctpBridge from "./cctp-bridge/structs";
import * as events from "./events/structs";
import * as messageTransmitterAuthenticator from "./message-transmitter-authenticator/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(messageTransmitterAuthenticator.MessageTransmitterAuthenticator);
  loader.register(events.ReceiveFeeEvent);
  loader.register(events.TokensReceivedEvent);
  loader.register(events.TokensSentEvent);
  loader.register(events.RecipientReplaced);
  loader.register(cctpBridge.AdminCap);
  loader.register(cctpBridge.FeeCollectorCap);
  loader.register(cctpBridge.CctpBridge);
}
