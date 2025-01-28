// @ts-nocheck
import * as burnMessage from "./burn-message/structs";
import * as depositForBurn from "./deposit-for-burn/structs";
import * as handleReceiveMessage from "./handle-receive-message/structs";
import * as messageTransmitterAuthenticator from "./message-transmitter-authenticator/structs";
import * as state from "./state/structs";
import { StructClassLoader } from "../../../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(state.State);
  loader.register(burnMessage.BurnMessage);
  loader.register(depositForBurn.DepositForBurnTicket);
  loader.register(depositForBurn.ReplaceDepositForBurnTicket);
  loader.register(messageTransmitterAuthenticator.MessageTransmitterAuthenticator);
  loader.register(handleReceiveMessage.StampReceiptTicketWithBurnMessage);
}
