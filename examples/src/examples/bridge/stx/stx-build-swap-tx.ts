import { AllbridgeCoreSdk, RawStxTransaction, SwapParams } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendStxRawTransaction } from "../../../utils/stx";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address on STX
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");
  const tokenAddress2 = getEnvVar("STX_TOKEN2_ADDRESS", tokenAddress);

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);

  const sourceToken = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));
  const destinationToken = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress2));

  const amount = "10";

  // Build raw transaction for swap (source and destination on STX in this stub)
  const swapParams: SwapParams = {
    amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: accountAddress,
    sourceToken,
    destinationToken,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken),
  };
  const rawTx = (await sdk.bridge.rawTxBuilder.send(swapParams)) as RawStxTransaction;

  console.log(`Swaping ${amount} ${sourceToken.symbol}`);
  const txId = await sendStxRawTransaction(rawTx);
  console.log("txId:", txId);
};

main()
  .then(() => console.log("Done"))
  .catch((e) => console.error(e));
