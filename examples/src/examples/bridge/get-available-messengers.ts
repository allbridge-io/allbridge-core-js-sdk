import {
  ActiveMessenger,
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  TokenWithChainDetails,
} from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";

/**
 * Returns messengers that can be used to transfer tokens between sourceToken and destinationToken.
 * All the required data is contained in TokenWithChainDetails returned by sdk.chainDetailsMap() / sdk.tokens().
 */
function getAvailableMessengers(
  sourceToken: TokenWithChainDetails,
  destinationToken: TokenWithChainDetails
): ActiveMessenger[] {
  const messengers: ActiveMessenger[] = [];
  // CCTP: both tokens must have cctpAddress
  if (sourceToken.cctpAddress && destinationToken.cctpAddress) {
    messengers.push(Messenger.CCTP);
  }
  // CCTP V2: both tokens must have cctpV2Address
  if (sourceToken.cctpV2Address && destinationToken.cctpV2Address) {
    messengers.push(Messenger.CCTP_V2);
  }
  // OFT: the same oftId on both tokens and oftBridgeAddress on both chains
  if (
    sourceToken.oftId &&
    sourceToken.oftId === destinationToken.oftId &&
    sourceToken.oftBridgeAddress &&
    destinationToken.oftBridgeAddress
  ) {
    messengers.push(Messenger.OFT);
  }
  // xReserve: both tokens must have xReserve config
  if (sourceToken.xReserve && destinationToken.xReserve) {
    messengers.push(Messenger.X_RESERVE);
  }
  return messengers;
}

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceToken = ensure(chains[ChainSymbol.ETH].tokens.find((token) => token.symbol === "USDC"));
  const destinationToken = ensure(chains[ChainSymbol.ARB].tokens.find((token) => token.symbol === "USDC"));

  const messengers = getAvailableMessengers(sourceToken, destinationToken);
  console.log(
    "Messengers available for %s (%s) -> %s (%s): %s",
    sourceToken.symbol,
    sourceToken.chainSymbol,
    destinationToken.symbol,
    destinationToken.chainSymbol,
    messengers.map((messenger) => Messenger[messenger]).join(", ")
  );

  for (const messenger of messengers) {
    const amount = "100";
    // transfer time is null when the messenger is not available between the chains
    const transferTimeMs = sdk.getAverageTransferTime(sourceToken, destinationToken, messenger);
    const amountToBeReceived = await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken, messenger);
    const gasFeeOptions = await sdk.getGasFeeOptions(sourceToken, destinationToken, messenger);
    console.log(
      "%s: send %s %s to receive %s %s, gas fee %s %s, average transfer time %s ms",
      Messenger[messenger],
      amount,
      sourceToken.symbol,
      amountToBeReceived,
      destinationToken.symbol,
      gasFeeOptions.native.float,
      sourceToken.chainSymbol,
      transferTimeMs
    );
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
