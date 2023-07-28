import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SOL_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const halfToken = "0.5";
  const estimatedAmount = await sdk.pool.getAmountToBeWithdrawn(halfToken, accountAddress, tokenInfo);

  console.log("If you withdraw %d LP tokens, then %d will be received", halfToken, estimatedAmount);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
