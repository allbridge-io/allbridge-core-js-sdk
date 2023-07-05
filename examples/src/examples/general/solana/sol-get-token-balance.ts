import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SOL_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const tokenBalanceData = {
    account: accountAddress,
    token: tokenInfo,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    token: tokenInfo,
  };
  const tokenBalanceWithPrecision = await sdk.getTokenBalance(tokenBalanceWithPrecisionData);
  console.log("With precision:", tokenBalanceWithPrecision);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
