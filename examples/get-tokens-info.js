const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");

async function runExample() {
  const sdk = new AllbridgeCoreSdk();

  const tokensInfo = await sdk.getTokensInfo();

  const chainDetailsMap = tokensInfo.chainDetailsMap();
  console.log("Chain details map =", JSON.stringify(chainDetailsMap, null, 2));

  const tokens = tokensInfo.tokens();
  console.log("Tokens =", JSON.stringify(tokens, null, 2));
}

runExample();
