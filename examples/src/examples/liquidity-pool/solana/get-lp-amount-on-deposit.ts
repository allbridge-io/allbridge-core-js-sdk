import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SOL_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1";
  const estimatedAmount = await sdk.pool.getAmountToBeDeposited(oneToken, tokenInfo);

  console.log("If you send %d , then %d of LP tokens will be deposited", oneToken, estimatedAmount);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
