import { AllbridgeCoreSdk, ChainSymbol, Messenger } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3, { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");
const toAddressPol = getEnvVar("POL_ACCOUNT_ADDRESS");

const exampleViaWormhole = async () => {
  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChainPol = chains[ChainSymbol.POL];
  const destinationTokenInfoPol = ensure(destinationChainPol.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.WORMHOLE
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: "3.3",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressPol,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoPol,
    messenger: Messenger.WORMHOLE,
  })) as Transaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  const connection = new solanaWeb3.Connection(sdk.params.solanaRpcUrl, "confirmed");
  transaction.partialSign(keypair);
  const wiredTx = transaction.serialize();
  const signature = await connection.sendRawTransaction(wiredTx);
  console.log("Signature via WORMHOLE:", signature);
};

const exampleViaAllbridge = async () => {
  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChainPol = chains[ChainSymbol.POL];
  const destinationTokenInfoPol = ensure(destinationChainPol.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.ALLBRIDGE
  const transaction = await sdk.bridge.rawTxBuilder.send({
    amount: "4.4",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressPol,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoPol,
    messenger: Messenger.ALLBRIDGE,
  });
  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  const connection = new solanaWeb3.Connection(sdk.params.solanaRpcUrl, "confirmed");
  const signature = await sendAndConfirmTransaction(connection, transaction as any, [keypair]);

  console.log("Signature via ALLBRIDGE:", signature);
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
