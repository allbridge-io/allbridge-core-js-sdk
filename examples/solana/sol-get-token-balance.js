const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
require("dotenv").config({ path: "../.env" });

async function runExample() {
  const tokenAddress = process.env.SOL_TOKEN_ADDRESS;
  const accountAddress = process.env.SOL_ACCOUNT_ADDRESS;

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find(
    (tokenInfo) => tokenInfo.tokenAddress === tokenAddress
  );
  const tokenDecimals = tokenInfo.decimals;

  const tokenBalanceData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
    tokenDecimals: tokenDecimals,
  };
  const tokenBalanceWithPrecision = await sdk.getTokenBalance(
    tokenBalanceWithPrecisionData
  );
  console.log("With precision:", tokenBalanceWithPrecision);
}

runExample();
