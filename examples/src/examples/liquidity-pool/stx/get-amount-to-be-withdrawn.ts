import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
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
