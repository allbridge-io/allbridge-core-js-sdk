const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../.env" });

async function runExample() {
  const providerUrl = process.env.TRONWEB_PROVIDER_URL;
  const privateKey = process.env.TRX_PRIVATE_KEY;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;
  const poolAddress = process.env.TRX_POOL_ADDRESS;

  const tronWeb = new TronWeb(
    providerUrl,
    providerUrl,
    providerUrl,
    privateKey
  );

  const sdk = new AllbridgeCoreSdk();
  const approveData = {
    tokenAddress: tokenAddress,
    owner: accountAddress,
    spender: poolAddress,
  };
  const approveResponse = await sdk.approve(tronWeb, approveData);
  console.log("approve response: ", approveResponse);
}

runExample();
