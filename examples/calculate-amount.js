const {
  AllbridgeCoreSdk,
  production,
  Messenger,
} = require("@allbridge/bridge-core-sdk");

async function runExample() {
  const sdk = new AllbridgeCoreSdk(production);

  const tokensInfo = await sdk.getTokensInfo();

  const tokens = tokensInfo.tokens();
  const sourceToken = tokens[0];
  const destinationToken = tokens[tokens.length - 1];
  const amount = "100.5";

  const txCost = await sdk.getTxCost(
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );

  const amountToBeReceived = sdk.getAmountToBeReceived(
    amount,
    sourceToken,
    destinationToken
  );
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

  const amountToSend = sdk.getAmountToSend(
    amount,
    sourceToken,
    destinationToken
  );
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

  {
    const { toAmount, txCost } = await sdk.getAmountToBeReceivedAndTxCost(
      amount,
      sourceToken,
      destinationToken,
      Messenger.ALLBRIDGE
    );
    console.log(
      "Send %d %s with value %d on %s to receive %d %s on %s",
      amount,
      sourceToken.symbol,
      txCost,
      sourceToken.chainSymbol,
      toAmount,
      destinationToken.symbol,
      destinationToken.chainSymbol
    );
  }

  {
    const { fromAmount, txCost } = await sdk.getAmountToSendAndTxCost(
      amount,
      sourceToken,
      destinationToken,
      Messenger.ALLBRIDGE
    );
    console.log(
      "Send %d %s with value %d on %s to receive %d %s on %s",
      fromAmount,
      sourceToken.symbol,
      txCost,
      sourceToken.chainSymbol,
      amount,
      destinationToken.symbol,
      destinationToken.chainSymbol
    );
  }
}

runExample();
