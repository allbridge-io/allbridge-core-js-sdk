const {
  AllbridgeCoreSdk,
  production,
} = require("@allbridge/allbridge-core-sdk");

async function runExample() {
  const sdk = new AllbridgeCoreSdk(production);

  const tokensInfo = await sdk.getTokensInfo();

  const chainDetailsMap = tokensInfo.chainDetailsMap();
  console.log("Chain details map =", JSON.stringify(chainDetailsMap, null, 2));

  const tokens = tokensInfo.tokens();
  console.log("Tokens =", JSON.stringify(tokens, null, 2));
}

runExample();
