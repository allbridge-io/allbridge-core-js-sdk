// @ts-nocheck
import * as message from "./message/structs";
import * as receiveMessage from "./receive-message/structs";
import * as state from "./state/structs";
import { StructClassLoader } from "../../../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(state.State);
  loader.register(message.Message);
  loader.register(receiveMessage.Receipt);
  loader.register(receiveMessage.StampReceiptTicket);
  loader.register(receiveMessage.StampedReceipt);
}
