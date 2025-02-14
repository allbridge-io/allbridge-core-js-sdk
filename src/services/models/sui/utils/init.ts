// @ts-nocheck
import * as bytes32 from "./bytes32/structs";
import * as feeCollector from "./fee-collector/structs";
import * as message from "./message/structs";
import * as messengerProtocol from "./messenger-protocol/structs";
import * as set from "./set/structs";
import * as version from "./version/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(messengerProtocol.MessengerProtocol);
  loader.register(bytes32.Bytes32);
  loader.register(message.Message);
  loader.register(version.CurrentVersion);
  loader.register(set.Empty);
  loader.register(set.Set);
  loader.register(feeCollector.FeeCollector);
}
