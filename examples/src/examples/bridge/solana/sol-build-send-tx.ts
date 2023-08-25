import { AllbridgeCoreSdk, ChainSymbol, Messenger, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3, { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");
const toAddressPol = getEnvVar("POL_ACCOUNT_ADDRESS");

const exampleViaWormhole = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChainPol = chains[ChainSymbol.POL];
  const destinationTokenInfoPol = ensure(destinationChainPol.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.WORMHOLE
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: "0.2",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressPol,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoPol,
    messenger: Messenger.WORMHOLE,
  })) as VersionedTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(nodeUrlsDefault.solanaRpcUrl, "confirmed");
  const txid = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txid}`);
};

const exampleViaAllbridge = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChainPol = chains[ChainSymbol.POL];
  const destinationTokenInfoPol = ensure(destinationChainPol.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.ALLBRIDGE
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: "0.2",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressPol,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoPol,
    messenger: Messenger.ALLBRIDGE,
  })) as VersionedTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(nodeUrlsDefault.solanaRpcUrl, "confirmed");
  const txid = await connection.sendTransaction(transaction);
  console.log(`https://explorer.solana.com/tx/${txid}`);
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
