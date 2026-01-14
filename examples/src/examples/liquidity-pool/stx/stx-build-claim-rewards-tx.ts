import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawStxTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendStxRawTransaction } from "../../../utils/stx";

// Note: STX (Stacks) support in SDK is currently a stub. This example demonstrates
// how it will look once implemented. Running it now will throw a "not implemented" error.

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  // create claim rewards raw transaction
  const rawTx = (await sdk.pool.rawTxBuilder.claimRewards({
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawStxTransaction;

  const txId = await sendStxRawTransaction(rawTx);
  console.log("Token claim rewards:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
