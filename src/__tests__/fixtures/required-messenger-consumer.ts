import { AllbridgeCoreSdk, PoolInfo, TokenWithChainDetails } from "../../index";
import { getSpender } from "../../services/bridge";

declare const sdk: AllbridgeCoreSdk;
declare const sourceToken: TokenWithChainDetails;
declare const destinationToken: TokenWithChainDetails;
declare const sourcePool: PoolInfo;
declare const destinationPool: PoolInfo;

void sdk.getAmountToBeReceived("1", sourceToken, destinationToken);
void sdk.getAmountToBeReceivedFromChain("1", sourceToken, destinationToken);
void sdk.getAmountToBeReceivedFromPools("1", sourceToken, destinationToken, sourcePool, destinationPool);
void sdk.getAmountToSend("1", sourceToken, destinationToken);
void sdk.getAmountToSendFromChain("1", sourceToken, destinationToken);
void sdk.getAmountToSendFromPools("1", sourceToken, destinationToken, sourcePool, destinationPool);
void sdk.getExtraGasMaxLimits(sourceToken, destinationToken);
void getSpender(sourceToken);
