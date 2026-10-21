import {
  AllbridgeCoreSdk,
  ChainSymbol,
  isLifiIntentsRouteSupported,
  Messenger,
  nodeRpcUrlsDefault,
  RawEvmTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { sendEvmRawTransaction } from "../../../utils/web3";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // sender address
  const toAddress = getEnvVar("ARB_ACCOUNT_ADDRESS"); // recipient address

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.ARB];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const messenger = Messenger.LIFI_INTENTS;
  if (!isLifiIntentsRouteSupported(sourceToken, destinationToken)) {
    throw new Error("LI.FI Intents does not serve this route");
  }

  const amount = "1.01";

  // the quote: what the recipient gets and the Allbridge fee (a part of the amount)
  const quote = await sdk.lifiIntents.getQuote({ amount, sourceToken, destinationToken });
  console.log(
    `Sending ${quote.amountIn} ${sourceToken.symbol} (fee ${quote.fee}) to receive ${quote.amountOut} ${destinationToken.symbol} in about ${quote.timeEstimate} s`
  );

  // check if sending tokens already approved to the LifiIntentsBridge (a native token needs no approval)
  if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount, messenger }))) {
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: sourceToken,
      owner: fromAddress,
      messenger,
    })) as RawEvmTransaction;
    const approveTxReceipt = await sendEvmRawTransaction(rawTransactionApprove);
    console.log("Approve tx id:", approveTxReceipt.transactionHash);
  }

  // create the order right before signing: it is valid for about a minute
  const { rawTransaction, order } = await sdk.lifiIntents.buildSendTransaction({
    amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken,
    destinationToken,
  });
  console.log(`Order ${order.orderId}: sign before ${order.fillDeadline.toISOString()}`);
  const txReceipt = await sendEvmRawTransaction(rawTransaction as RawEvmTransaction);
  console.log("tx id:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
