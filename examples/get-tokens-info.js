const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");

async function runExample() {
  const sdk = new AllbridgeCoreSdk();

  const chainDetailsMap = await sdk.chainDetailsMap();
  console.log("Chain details map =", JSON.stringify(chainDetailsMap, null, 2));

  const tokens = await sdk.tokens();
  console.log("Tokens =", JSON.stringify(tokens, null, 2));
}

runExample();
