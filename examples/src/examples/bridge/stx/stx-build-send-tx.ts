import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  RawStxTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendStxRawTransaction } from "../../../utils/stx";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address on STX
  const accountAddress = getEnvVar("STX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("STX_TOKEN_ADDRESS");
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // recipient address on destination chain
  const toToken = getEnvVar("ETH_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, STX: getEnvVar("STX_PROVIDER_URL") });
  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.STX];
  const sourceToken = ensure(sourceChain.tokens.find((t) => t.tokenAddress === tokenAddress));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationToken = ensure(destinationChain.tokens.find((t) => t.tokenAddress === toToken));

  const amount = "10";

  // Build raw transaction for sending tokens
  const rawTx = (await sdk.bridge.rawTxBuilder.send({
    amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: toAddress,
    sourceToken,
    destinationToken,
    messenger: Messenger.ALLBRIDGE,
  })) as RawStxTransaction;

  console.log(`Sending ${amount} ${sourceToken.symbol}`);
  const txId = await sendStxRawTransaction(rawTx);
  console.log("txId:", txId);
};

main()
  .then(() => console.log("Done"))
  .catch((e) => console.error(e));
