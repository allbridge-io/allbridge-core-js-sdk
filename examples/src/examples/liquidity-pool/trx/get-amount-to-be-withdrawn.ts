import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
// @ts-expect-error import tron
import TronWeb from "tronweb";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const halfToken = "0.5";
  const estimatedAmount = await sdk.pool.getAmountToBeWithdrawn(halfToken, accountAddress, tokenInfo, tronWeb);

  console.log("If you withdraw %d LP tokens, then %d will be received", halfToken, estimatedAmount);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
