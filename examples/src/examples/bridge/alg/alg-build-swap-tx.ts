import {
  AllbridgeCoreSdk,
  ChainSymbol,
  nodeRpcUrlsDefault,
  RawAlgTransaction,
  SwapParams,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendAlgRawTransaction } from "../../../utils/alg";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("ALG_ACCOUNT_ADDRESS"); // sender address
  const toAddress = getEnvVar("ALG_ACCOUNT_ADDRESS"); // recipient address
  const tokenAddress = getEnvVar("ALG_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ALG: getEnvVar("ALG_PROVIDER_URL") });
  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ALG];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const destinationChain = chains[ChainSymbol.ALG];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "10";

  // initiate transfer
  const swapParams: SwapParams = {
    amount: amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken),
  };
  const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send(swapParams)) as RawAlgTransaction;

  console.log(`Swaping ${amount} ${sourceToken.symbol}`);
  const txId = await sendAlgRawTransaction(rawTransactionTransfer);
  console.log("tx id:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
