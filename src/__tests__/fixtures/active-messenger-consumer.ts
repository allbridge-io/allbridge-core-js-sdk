import {
  AllbridgeCoreSdk,
  Messenger,
  PoolInfo,
  RawBridgeTransactionBuilder,
  SendParams,
  TokenWithChainDetails,
} from "../../index";
import { getSpender } from "../../services/bridge";

declare const sdk: AllbridgeCoreSdk;
declare const sourceToken: TokenWithChainDetails;
declare const destinationToken: TokenWithChainDetails;
declare const sourcePool: PoolInfo;
declare const destinationPool: PoolInfo;
declare const rawBridgeTxBuilder: RawBridgeTransactionBuilder;
declare const sendParams: SendParams;

void sdk.getAmountToBeReceived("1", sourceToken, destinationToken, Messenger.CCTP);
void sdk.getAmountToBeReceivedFromChain("1", sourceToken, destinationToken, Messenger.CCTP);
void sdk.getAmountToBeReceivedFromPools(
  "1",
  sourceToken,
  destinationToken,
  sourcePool,
  destinationPool,
  Messenger.CCTP
);
void sdk.getAmountToSend("1", sourceToken, destinationToken, Messenger.CCTP);
void sdk.getAmountToSendFromChain("1", sourceToken, destinationToken, Messenger.CCTP);
void sdk.getAmountToSendFromPools("1", sourceToken, destinationToken, sourcePool, destinationPool, Messenger.CCTP);
void sdk.getExtraGasMaxLimits(sourceToken, destinationToken, Messenger.CCTP);
void getSpender(sourceToken, Messenger.CCTP);
void rawBridgeTxBuilder.send(sendParams);
