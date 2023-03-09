const { AllbridgeCoreSdk, Messenger } = require("@allbridge/bridge-core-sdk");

async function runExampleCalculateAmounts() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDT");
  const destinationToken = tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT");
  const amount = "100.5";

  const txCost = await sdk.getTxCost(sourceToken, destinationToken, Messenger.ALLBRIDGE);

  const amountToBeReceived = await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken);
  console.log(
    "Send %d %s with value %d on %s to receive %d %s on %s",
    amount,
    sourceToken.symbol,
    txCost,
    sourceToken.chainSymbol,
    amountToBeReceived,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );

  const amountToSend = await sdk.getAmountToSend(amount, sourceToken, destinationToken);
  console.log(
    "Send %d %s with value %d on %s to receive %d %s on %s",
    amountToSend,
    sourceToken.symbol,
    txCost,
    sourceToken.chainSymbol,
    amount,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
}

async function runExampleGetAmountToBeReceivedAndTxCost() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDT");
  const destinationToken = tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT");
  const amount = "100.5";

  const { amountToSendFloat, amountToBeReceivedFloat, txCost } = await sdk.getAmountToBeReceivedAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
  console.log(
    "Send %d %s with value %d on %s to receive %d %s on %s",
    amountToSendFloat,
    sourceToken.symbol,
    txCost,
    sourceToken.chainSymbol,
    amountToBeReceivedFloat,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
}

async function runExampleGetAmountToSendAndTxCost() {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDT");
  const destinationToken = tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT");
  const amount = "100.5";

  const { amountToSendFloat, amountToBeReceivedFloat, txCost } = await sdk.getAmountToSendAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
  console.log(
    "Send %d %s with value %d on %s to receive %d %s on %s",
    amountToSendFloat,
    sourceToken.symbol,
    txCost,
    sourceToken.chainSymbol,
    amountToBeReceivedFloat,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
}

runExampleCalculateAmounts();
runExampleGetAmountToBeReceivedAndTxCost();
runExampleGetAmountToSendAndTxCost();
