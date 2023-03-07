const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.TRONWEB_PROVIDER_URL;
  const privateKey = process.env.TRX_PRIVATE_KEY;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const halfToken = 0.5;
  const estimatedAmount = await sdk.getAmountToBeWithdrawn(halfToken, accountAddress, tokenInfo, tronWeb);

  console.log("If you withdraw %d LP tokens, then %d will be received", halfToken, estimatedAmount);
}

runExample();
