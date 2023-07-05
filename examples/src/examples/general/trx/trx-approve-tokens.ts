import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";

import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const poolAddress = getEnvVar("TRX_POOL_ADDRESS");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  const approveData = {
    token: tokenInfo,
    owner: accountAddress,
  };
  const approveResponse = await sdk.bridge.approve(tronWeb, approveData);
  console.log("approve response: ", approveResponse);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
