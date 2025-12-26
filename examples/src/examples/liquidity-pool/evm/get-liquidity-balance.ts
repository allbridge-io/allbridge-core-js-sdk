import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const userBalanceInfo = await sdk.pool.getUserBalanceInfo(accountAddress, tokenInfo);
  const poolInfo = await sdk.pool.getPoolInfoFromChain(tokenInfo);

  console.log("Evm User balance: ", userBalanceInfo.userLiquidity);
  console.log("Evm User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Evm PoolInfo APR: ", sdk.aprInPercents(tokenInfo.apr7d));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
