import { AllbridgeCoreSdk, ChainSymbol, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import solanaWeb3, { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

dotenv.config({ path: ".env" });

const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SOL_PRIVATE_KEY");

const example = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChainPol = chains[ChainSymbol.SOL];
  const destinationTokenInfo = ensure(destinationChainPol.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // initiate transfer using Messenger.WORMHOLE
  const amount = "10";
  const transaction = (await sdk.bridge.rawTxBuilder.send({
    amount: amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: accountAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceTokenInfo, destinationTokenInfo),
  })) as VersionedTransaction;

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  transaction.sign([keypair]);

  const connection = new solanaWeb3.Connection(nodeUrlsDefault.solanaRpcUrl, "confirmed");
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
