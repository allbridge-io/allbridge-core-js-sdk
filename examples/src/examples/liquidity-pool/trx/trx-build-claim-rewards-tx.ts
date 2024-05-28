import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawTronTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendTrxRawTransaction } from "../../../utils/tronWeb";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  // create claim rewards raw transaction
  const rawTransactionDeposit = (await sdk.pool.rawTxBuilder.claimRewards({
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawTronTransaction;

  const txReceipt = await sendTrxRawTransaction(rawTransactionDeposit);
  console.log("Token claim rewards:", txReceipt.txid);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
