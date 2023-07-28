import * as dotenv from "dotenv";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1";
  const estimatedAmount = await sdk.pool.getAmountToBeDeposited(oneToken, tokenInfo, tronWeb);

  console.log("If you send %d , then %d of LP tokens will be deposited", oneToken, estimatedAmount);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
