import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, RawStxTransaction } from "@allbridge/bridge-core-sdk";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";
import { sendStxRawTransaction } from "../../../utils/stx";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  const oneToken = "1.01";
  // create deposit raw transaction
  const rawTx = (await sdk.pool.rawTxBuilder.deposit({
    amount: oneToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawStxTransaction;

  const txId = await sendStxRawTransaction(rawTx);
  console.log("Token deposit:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
