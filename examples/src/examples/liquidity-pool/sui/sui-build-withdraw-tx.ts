import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawSuiTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendSuiRawTransaction } from "../../../utils/sui";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("SUI_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("SUI_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.originTokenAddress === tokenAddress));

  const halfToken = "0.5";
  // create withdraw raw transaction
  const xdr = (await sdk.pool.rawTxBuilder.withdraw({
    amount: halfToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawSuiTransaction;

  const txReceipt = await sendSuiRawTransaction(xdr);
  console.log("Token withdraw:", txReceipt);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
