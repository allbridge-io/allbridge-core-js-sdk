import {
  AllbridgeCoreSdk,
  nodeRpcUrlsDefault,
  RawSuiTransaction,
  SwapParams,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendSuiRawTransaction } from "../../../utils/sui";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("SUI_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("SUI_TOKEN_ADDRESS");
  const tokenAddress2 = getEnvVar("SUI_TOKEN2_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const sourceToken = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.originTokenAddress === tokenAddress));

  const destinationToken = ensure(
    (await sdk.tokens()).find((tokenInfo) => tokenInfo.originTokenAddress === tokenAddress2)
  );

  const amount = "10";

  // initiate transfer
  const swapParams: SwapParams = {
    amount: amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: accountAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken),
  };
  const xdr = (await sdk.bridge.rawTxBuilder.send(swapParams)) as RawSuiTransaction;

  const txReceipt = await sendSuiRawTransaction(xdr);
  console.log("tx id:", txReceipt);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
