const {
  AllbridgeCoreSdk,
  TronProvider,
} = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config();

async function runExample() {
  const providerUrl = process.env.PROVIDER_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const poolAddress = process.env.POOL_ADDRESS;

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
  const approveResponse = await sdk.approve(
    new TronProvider(tronWeb),
    approveData
  );
  console.log("approve response: ", approveResponse);
}

runExample();
