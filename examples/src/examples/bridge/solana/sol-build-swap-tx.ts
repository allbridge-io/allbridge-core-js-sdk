import {
  AllbridgeCoreSdk,
  ChainSymbol,
  nodeRpcUrlsDefault,
  RawBridgeSolanaTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3 from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");

const example = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.SOL];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.WORMHOLE
  const amount = "10";
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: accountAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken),
  })) as RawBridgeSolanaTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(ensure(nodeRpcUrlsDefault.SOL), "confirmed");
  const txid = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txid}`);
};

example()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
