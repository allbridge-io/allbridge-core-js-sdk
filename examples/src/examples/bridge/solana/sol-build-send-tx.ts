import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  RawBridgeSolanaTransaction,
  SolanaAutoTxFee,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3 from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");
const toAddress = getEnvVar("POL_ACCOUNT_ADDRESS");

const exampleViaWormhole = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.POL];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.WORMHOLE
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: "0.2",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.WORMHOLE,
    //Optional add solana fee for a faster and more convincing transaction
    txFeeParams: {
      solana: SolanaAutoTxFee, // look SolanaTxFee for details
    },
  })) as RawBridgeSolanaTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(ensure(nodeRpcUrlsDefault.SOL), "confirmed");
  const txId = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txId}`);
};

const exampleViaAllbridge = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.POL];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.ALLBRIDGE
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: "0.2",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
  })) as RawBridgeSolanaTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(ensure(nodeRpcUrlsDefault.SOL), "confirmed");
  const txId = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txId}`);
};

exampleViaWormhole()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
exampleViaAllbridge()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
