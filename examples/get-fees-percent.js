const { AllbridgeCoreSdk } = require("..");
const configs = require("../build/src/configs");

async function runExample() {
  const sdk = new AllbridgeCoreSdk(configs.development);

  const tokensInfo = await sdk.getTokensInfo();

  const tokens = tokensInfo.tokens();
  const sourceToken = tokens[0];
  const destinationToken = tokens[tokens.length - 1];
  const amount = "100.5";

  console.log(
    "%d %s on %s to %s on %s",
    amount,
    sourceToken.symbol,
    sourceToken.chainSymbol,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );

  const sourceFeePercent = sdk.calculateFeesPercentOnSourceChain(
    amount,
    sourceToken
  );
  console.log("Fees on the source chain = %s%", sourceFeePercent.toFixed(2));

  const destinationFeesPercent = sdk.calculateFeesPercentOnDestinationChain(
    amount,
    sourceToken,
    destinationToken
  );
  console.log(
    "Fees on the destination chain = %s%",
    destinationFeesPercent.toFixed(2)
  );
}

runExample();
