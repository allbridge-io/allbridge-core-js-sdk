import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawAlgTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendAlgRawTransaction } from "../../../utils/alg";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ALG_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ALG_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ALG: getEnvVar("ALG_PROVIDER_URL") });
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1.1";
  // create deposit raw transaction
  const rawTransactionDeposit = (await sdk.pool.rawTxBuilder.deposit({
    amount: oneToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawAlgTransaction;

  const txId = await sendAlgRawTransaction(rawTransactionDeposit);
  console.log("Token deposit:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
