const { AllbridgeCoreSdk } = require("..");
const configs = require("../build/src/configs");

async function runExample() {
  const sdk = new AllbridgeCoreSdk(configs.development);

  const tokensInfo = await sdk.getTokensInfo();

  const tokens = tokensInfo.tokens();
  const sourceToken = tokens[0];
  const destinationToken = tokens[tokens.length - 1];
  const amount = "100.5";

  const amountToBeReceived = sdk.calculateAmountToBeReceived(
    amount,
    sourceToken,
    destinationToken
  );
  console.log(
    "Send %d %s on %s to receive %d %s on %s",
    amount,
    sourceToken.symbol,
    sourceToken.chainSymbol,
    amountToBeReceived,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );

  const amountToSend = sdk.calculateAmountToSend(
    amount,
    sourceToken,
    destinationToken
  );
  console.log(
    "Send %d %s on %s to receive %d %s on %s",
    amountToSend,
    sourceToken.symbol,
    sourceToken.chainSymbol,
    amount,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );
}

runExample();
