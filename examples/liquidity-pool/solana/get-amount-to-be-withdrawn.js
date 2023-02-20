const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const tokenAddress = process.env.SOL_TOKEN_ADDRESS;
  const accountAddress = process.env.SOL_ACCOUNT_ADDRESS;

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find(
    (tokenInfo) => tokenInfo.tokenAddress === tokenAddress
  );

  const halfToken = 0.5;
  const estimatedAmount = await sdk.getAmountToBeWithdrawn(
    halfToken,
    accountAddress,
    tokenInfo
  );

  console.log(
    "If you withdraw %d LP tokens, then %d will be received",
    halfToken,
    estimatedAmount
  );
}

runExample();
