import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, RawStxTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";
import { sendStxRawTransaction } from "../../../utils/stx";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  const halfToken = "0.5";
  // create withdraw raw transaction
  const rawTx = (await sdk.pool.rawTxBuilder.withdraw({
    amount: halfToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawStxTransaction;

  const txId = await sendStxRawTransaction(rawTx);
  console.log("Token withdraw:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
