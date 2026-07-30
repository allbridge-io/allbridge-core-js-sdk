import { AllbridgeCoreSdk, Messenger, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";

async function runExampleCalculateAmounts() {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "POL" && token.symbol === "USDC"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDC"));
  const amount = "100.5";
  const sourceChainMinUnit = "wei";
  const messenger = Messenger.CCTP;

  const gasFeeOptions = await sdk.getGasFeeOptions(sourceToken, destinationToken, messenger);

  const amountToBeReceived = await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken, messenger);
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amount,
    sourceToken.symbol,
    gasFeeOptions.native.int,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amountToBeReceived,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = gasFeeOptions.stablecoin.float;
    console.log(
      "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
      amount,
      sourceToken.symbol,
      floatGasFeeAmount,
      sourceToken.symbol,
      sourceToken.chainSymbol,
      amountToBeReceived,
      destinationToken.symbol,
      destinationToken.chainSymbol
    );
  }

  const amountToSend = await sdk.getAmountToSend(amount, sourceToken, destinationToken, messenger);
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amountToSend,
    sourceToken.symbol,
    gasFeeOptions.native.int,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amount,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = gasFeeOptions.stablecoin.float;
    console.log(
      "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
      amountToSend,
      sourceToken.symbol,
      floatGasFeeAmount,
      sourceToken.symbol,
      sourceToken.chainSymbol,
      amount,
      destinationToken.symbol,
      destinationToken.chainSymbol
    );
  }
}

runExampleCalculateAmounts()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
