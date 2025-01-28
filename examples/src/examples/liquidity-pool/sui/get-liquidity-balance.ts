import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SUI_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("SUI_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.originTokenAddress === tokenAddress));

  const userBalanceInfo = await sdk.pool.getUserBalanceInfo(accountAddress, tokenInfo);
  const poolInfo = await sdk.pool.getPoolInfoFromChain(tokenInfo);

  console.log("User balance: ", userBalanceInfo.userLiquidity);
  console.log("User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("PoolInfo APR: ", sdk.aprInPercents(tokenInfo.apr7d));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
