import { AllbridgeCoreSdk, ChainSymbol, Messenger, testnet } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3, { sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");
const toAddressEth = getEnvVar("ETH_ACCOUNT_ADDRESS");
const toAddressTrx = getEnvVar("TRX_ACCOUNT_ADDRESS");

const exampleViaWormhole = async () => {
  const sdk = new AllbridgeCoreSdk(testnet);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const destinationChainEth = chains[ChainSymbol.MUM];
  const destinationTokenInfoEth = ensure(destinationChainEth.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  // initiate transfer using Messenger.WORMHOLE
  // @ts-ignore
  const { transaction, signer } = await sdk.bridge.rawTxBuilder.send({
    amount: "3.3",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressEth,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoEth,
    messenger: Messenger.WORMHOLE,
  });

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  const connection = new solanaWeb3.Connection(sdk.params.solanaRpcUrl, "confirmed");
  const signature = await sendAndConfirmTransaction(connection, transaction, [keypair, signer]);

  console.log("Signature via WORMHOLE:", signature);
};

const exampleViaAllbridge = async () => {
  const sdk = new AllbridgeCoreSdk(testnet);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const destinationChainTrx = chains[ChainSymbol.MUM];
  const destinationTokenInfoTrx = ensure(destinationChainTrx.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  // initiate transfer using Messenger.ALLBRIDGE
  // @ts-ignore
  const { transaction } = await sdk.bridge.rawTxBuilder.send({
    amount: "4.4",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressEth,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfoTrx,
    messenger: Messenger.ALLBRIDGE,
  });

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  const connection = new solanaWeb3.Connection(sdk.params.solanaRpcUrl, "confirmed");
  const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

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
