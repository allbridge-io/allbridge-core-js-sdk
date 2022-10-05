const { AllbridgeCoreSdk } = require("..");
const configs = require("../build/src/configs");

async function runExample() {
  const sdk = new AllbridgeCoreSdk(configs.production);

  const tokensInfo = await sdk.getTokensInfo();

  const chainDetailsMap = tokensInfo.chainDetailsMap();
  console.log("Chain details map =", JSON.stringify(chainDetailsMap, null, 2));

  const tokens = tokensInfo.tokens();
  console.log("Tokens =", JSON.stringify(tokens, null, 2));
}

runExample();
