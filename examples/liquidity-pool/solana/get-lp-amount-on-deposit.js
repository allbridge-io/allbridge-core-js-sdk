const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const tokenAddress = process.env.SOL_TOKEN_ADDRESS;

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const oneToken = 1;
  const estimatedAmount = await sdk.getLPAmountOnDeposit(oneToken, tokenInfo);

  console.log("If you send %d , then %d of LP tokens will be deposited", oneToken, estimatedAmount);
}

runExample();
