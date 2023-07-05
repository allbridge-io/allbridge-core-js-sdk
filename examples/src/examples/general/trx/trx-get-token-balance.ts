import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const tokenBalanceData = {
    account: accountAddress,
    token: tokenInfo,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData, tronWeb);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    token: tokenInfo,
  };
  const tokenBalanceWithPrecision = await sdk.getTokenBalance(tokenBalanceWithPrecisionData, tronWeb);
  console.log("With precision:", tokenBalanceWithPrecision);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
