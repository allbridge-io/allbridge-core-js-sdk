import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawEvmTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendEvmRawTransaction } from "../../../utils/web3";
dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
    token: tokenInfo,
    owner: accountAddress,
  })) as RawEvmTransaction;
  const approveTxReceipt = await sendEvmRawTransaction(rawTransactionApprove);
  console.log("approve tx id:", approveTxReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
