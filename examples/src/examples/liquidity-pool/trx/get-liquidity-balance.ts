import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";

import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const userBalanceInfo = await sdk.pool.getUserBalanceInfo(accountAddress, tokenInfo, tronWeb);
  const poolInfo = await sdk.pool.getPool(tokenInfo, tronWeb);

  console.log("Tron User balance: ", userBalanceInfo.userLiquidity);
  console.log("Tron User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Tron Pool APR: ", sdk.aprInPercents(tokenInfo.apr));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
