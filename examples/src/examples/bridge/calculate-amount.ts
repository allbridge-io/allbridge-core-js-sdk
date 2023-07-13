import { AllbridgeCoreSdk, Messenger } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";
import Big from "big.js";

async function runExampleCalculateAmounts() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "POL" && token.symbol === "USDC"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT"));
  const amount = "100.5";
  const sourceChainMinUnit = "wei";

  const gasFeeOptions = await sdk.getGasFeeOptions(sourceToken, destinationToken, Messenger.ALLBRIDGE);

  const amountToBeReceived = await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken);
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amount,
    sourceToken.symbol,
    gasFeeOptions.native,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amountToBeReceived,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = new Big(gasFeeOptions.stablecoin).div(new Big(10).pow(sourceToken.decimals)).toFixed();
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

  const amountToSend = await sdk.getAmountToSend(amount, sourceToken, destinationToken);
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amountToSend,
    sourceToken.symbol,
    gasFeeOptions.native,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amount,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = new Big(gasFeeOptions.stablecoin).div(new Big(10).pow(sourceToken.decimals)).toFixed();
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

async function runExampleGetAmountToBeReceivedAndGasFeeOptions() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "POL" && token.symbol === "USDC"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT"));
  const amount = "100.5";
  const sourceChainMinUnit = "wei";

  const { amountToSendFloat, amountToBeReceivedFloat, gasFeeOptions } = await sdk.getAmountToBeReceivedAndGasFeeOptions(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amountToSendFloat,
    sourceToken.symbol,
    gasFeeOptions.native,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amountToBeReceivedFloat,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = new Big(gasFeeOptions.stablecoin).div(new Big(10).pow(sourceToken.decimals)).toFixed();
    console.log(
      "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
      amount,
      sourceToken.symbol,
      floatGasFeeAmount,
      sourceToken.symbol,
      sourceToken.chainSymbol,
      amountToBeReceivedFloat,
      destinationToken.symbol,
      destinationToken.chainSymbol
    );
  }
}

async function runExampleGetAmountToSendAndGasFeeOptions() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "POL" && token.symbol === "USDC"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT"));
  const amount = "100.5";
  const sourceChainMinUnit = "wei";

  const { amountToSendFloat, amountToBeReceivedFloat, gasFeeOptions } = await sdk.getAmountToSendAndGasFeeOptions(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
  console.log(
    "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
    amountToSendFloat,
    sourceToken.symbol,
    gasFeeOptions.native,
    sourceChainMinUnit,
    sourceToken.chainSymbol,
    amountToBeReceivedFloat,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
  if (gasFeeOptions.stablecoin) {
    // Option to pay with stablecoins is available
    const floatGasFeeAmount = new Big(gasFeeOptions.stablecoin).div(new Big(10).pow(sourceToken.decimals)).toFixed();
    console.log(
      "Send %d %s and %d %s (gas fee) on %s to receive %d %s on %s",
      amountToSendFloat,
      sourceToken.symbol,
      floatGasFeeAmount,
      sourceToken.symbol,
      sourceToken.chainSymbol,
      amountToBeReceivedFloat,
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

runExampleGetAmountToBeReceivedAndGasFeeOptions()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });

runExampleGetAmountToSendAndGasFeeOptions()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
