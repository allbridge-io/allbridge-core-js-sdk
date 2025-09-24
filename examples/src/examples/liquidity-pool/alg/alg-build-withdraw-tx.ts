import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawAlgTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";
import { sendAlgRawTransaction } from "../../../utils/alg";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ALG_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ALG_TOKEN_ADDRESS");

// const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ALG: getEnvVar("ALG_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const halfToken = "0.5";
  // create withdraw raw transaction
  const rawTransactionWithdraw = (await sdk.pool.rawTxBuilder.withdraw({
    amount: halfToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawAlgTransaction;

  const txId = await sendAlgRawTransaction(rawTransactionWithdraw);
  console.log("Token deposit:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
