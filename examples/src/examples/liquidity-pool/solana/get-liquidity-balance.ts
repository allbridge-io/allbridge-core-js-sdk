import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SOL_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));
  const userBalanceInfo = await sdk.pool.getUserBalanceInfo(accountAddress, tokenInfo);
  const poolInfo = await sdk.pool.getPoolInfoFromChain(tokenInfo);

  console.log("Solana User balance: ", userBalanceInfo.userLiquidity);
  console.log("Solana User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Solana PoolInfo APR: ", sdk.aprInPercents(tokenInfo.apr));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
