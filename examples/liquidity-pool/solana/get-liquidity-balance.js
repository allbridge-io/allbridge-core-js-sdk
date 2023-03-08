const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
require("dotenv").config({ path: "../../.env" });

async function runSolanaExample() {
  const tokenAddress = process.env.SOL_TOKEN_ADDRESS;
  const accountAddress = process.env.SOL_ACCOUNT_ADDRESS;

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);
  const userBalanceInfo = await sdk.getLiquidityBalanceInfo(accountAddress, tokenInfo);
  const poolInfo = await sdk.getPoolInfo(tokenInfo);

  console.log("Solana User balance: ", userBalanceInfo.userLiquidity);
  console.log("Solana User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Solana Pool APR: ", sdk.aprInPercents(tokenInfo.apr));
}

runSolanaExample();
