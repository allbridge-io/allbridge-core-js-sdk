import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("ALG_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("ALG_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ALG: getEnvVar("ALG_PROVIDER_URL") });

  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const tokenBalanceData = {
    account: accountAddress,
    token: tokenInfo,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData);
  console.log("Token Balance: ", tokenBalance);
  const nativeBalance = await sdk.getNativeTokenBalance({ account: accountAddress, chainSymbol: "ALG" });
  console.log("Native Balance: ", nativeBalance);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
