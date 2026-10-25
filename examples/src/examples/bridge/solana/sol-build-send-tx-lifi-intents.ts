import {
  AllbridgeCoreSdk,
  ChainSymbol,
  isLifiIntentsRouteSupported,
  nodeRpcUrlsDefault,
  RawBridgeSolanaTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3 from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");
const toAddress = getEnvVar("ARB_ACCOUNT_ADDRESS");

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.ARB];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  if (!isLifiIntentsRouteSupported(sourceToken, destinationToken)) {
    throw new Error("LI.FI Intents does not serve this route");
  }

  const amount = "1.01";

  // the quote: what the recipient gets and the Allbridge fee (a part of the amount)
  const quote = await sdk.lifiIntents.getQuote({ amount, sourceToken, destinationToken });
  console.log(
    `Sending ${quote.amountIn} ${sourceToken.symbol} (fee ${quote.fee}) to receive ${quote.amountOut} ${destinationToken.symbol} in about ${quote.timeEstimate} s`
  );

  // no approval on Solana: create the order right before signing, its blockhash is valid for about a minute
  const { rawTransaction, order } = await sdk.lifiIntents.buildSendTransaction({
    amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken,
    destinationToken,
  });
  console.log(`Order ${order.orderId}: sign before ${order.fillDeadline.toISOString()}`);

  const transaction = rawTransaction as RawBridgeSolanaTransaction;
  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(ensure(nodeRpcUrlsDefault.SOL), "confirmed");
  const txId = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txId}`);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
