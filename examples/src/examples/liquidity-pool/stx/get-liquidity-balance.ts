import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const userBalanceInfo = await sdk.pool.getUserBalanceInfo(accountAddress, tokenInfo);
  const poolInfo = await sdk.pool.getPoolInfoFromChain(tokenInfo);

  console.log("Alg User balance: ", userBalanceInfo.userLiquidity);
  console.log("Alg User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Alg PoolInfo APR: ", sdk.aprInPercents(tokenInfo.apr7d));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
