const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.TRONWEB_PROVIDER_URL;
  const privateKey = process.env.TRX_PRIVATE_KEY;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;

  const tronWeb = new TronWeb(
    providerUrl,
    providerUrl,
    providerUrl,
    privateKey
  );

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find(
    (tokenInfo) => tokenInfo.tokenAddress === tokenAddress
  );
  const tokenDecimals = tokenInfo.decimals;

  const tokenBalanceData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData, tronWeb);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
    tokenDecimals: tokenDecimals,
  };
  const tokenBalanceWithPrecision = await sdk.getTokenBalance(
    tokenBalanceWithPrecisionData,
    tronWeb
  );
  console.log("With precision:", tokenBalanceWithPrecision);
}

runExample();
