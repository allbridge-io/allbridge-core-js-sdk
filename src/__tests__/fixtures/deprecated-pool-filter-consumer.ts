import {
  AllbridgeCoreSdk,
  Messenger,
  PoolInfo,
  RawBridgeTransactionBuilder,
  SwapParams,
  TokenWithChainDetails,
} from "../../index";
import { getSpender } from "../../services/bridge";

declare const sdk: AllbridgeCoreSdk;
declare const sourceToken: TokenWithChainDetails;
declare const destinationToken: TokenWithChainDetails;
declare const sourcePool: PoolInfo;
declare const destinationPool: PoolInfo;
declare const rawBridgeTxBuilder: RawBridgeTransactionBuilder;
declare const swapParams: SwapParams;

void sdk.chainDetailsMap("pool");
void sdk.tokens("pool");
void sdk.tokensByChain("ETH", "pool");
void sdk.getAmountToBeReceived("1", sourceToken, destinationToken, Messenger.ALLBRIDGE);
void sdk.getAmountToBeReceivedFromChain("1", sourceToken, destinationToken, Messenger.WORMHOLE);
void sdk.getAmountToBeReceivedFromPools(
  "1",
  sourceToken,
  destinationToken,
  sourcePool,
  destinationPool,
  Messenger.ALLBRIDGE
);
void sdk.getAmountToSend("1", sourceToken, destinationToken, Messenger.WORMHOLE);
void sdk.getAmountToSendFromChain("1", sourceToken, destinationToken, Messenger.ALLBRIDGE);
void sdk.getAmountToSendFromPools("1", sourceToken, destinationToken, sourcePool, destinationPool, Messenger.WORMHOLE);
void sdk.getExtraGasMaxLimits(sourceToken, destinationToken, Messenger.ALLBRIDGE);
void getSpender(sourceToken, Messenger.WORMHOLE);
void rawBridgeTxBuilder.send(swapParams);
