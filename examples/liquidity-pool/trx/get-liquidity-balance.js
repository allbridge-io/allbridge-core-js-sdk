const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../../.env" });

async function runTronExample() {
  const providerUrl = process.env.TRONWEB_PROVIDER_URL;
  const privateKey = process.env.TRX_PRIVATE_KEY;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const userBalanceInfo = await sdk.getLiquidityBalanceInfo(accountAddress, tokenInfo, tronWeb);
  const poolInfo = await sdk.getPoolInfo(tokenInfo, tronWeb);

  console.log("Tron User balance: ", userBalanceInfo.userLiquidity);
  console.log("Tron User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Tron Pool APR: ", sdk.aprInPercents(tokenInfo.apr));
}

runTronExample();
