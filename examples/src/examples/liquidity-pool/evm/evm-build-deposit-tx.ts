import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, nodeRpcUrlsDefault, RawEvmTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { sendEvmRawTransaction } from "../../../utils/web3";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1";
  // create deposit raw transaction
  const rawTransactionDeposit = (await sdk.pool.rawTxBuilder.deposit({
    amount: oneToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawEvmTransaction;

  const txReceipt = await sendEvmRawTransaction(rawTransactionDeposit);
  console.log("Token deposit:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
