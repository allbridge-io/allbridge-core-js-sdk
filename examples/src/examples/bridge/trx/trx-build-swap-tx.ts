import { RawTransaction, AllbridgeCoreSdk, ChainSymbol, SwapParams, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { TransactionConfig } from "web3-core";
// @ts-expect-error import tron
import TronWeb from "tronweb";

dotenv.config({ path: ".env" });
const main = async () => {
  // sender address
  const fromAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  // recipient address
  const toAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  // configure TronWeb
  const tronWeb = new TronWeb(
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRX_PRIVATE_KEY")
  );

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.TRX];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "10";

  // initiate transfer
  const swapParams: SwapParams = {
    amount: amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceTokenInfo, destinationTokenInfo),
  };
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(swapParams, tronWeb);

  console.log(`Sending ${amount} ${sourceTokenInfo.symbol}`);
  const txReceipt = await sendRawTransaction(tronWeb, rawTransactionTransfer as TransactionConfig);
  console.log("tx id:", txReceipt.txid);
};
async function sendRawTransaction(tronWeb: TronWeb, rawTransaction: RawTransaction) {
  const signedTx = await tronWeb.trx.sign(rawTransaction);

  if (!signedTx.signature) {
    throw Error("Transaction was not signed properly");
  }

  // Broadcasting the transaction
  return await tronWeb.trx.sendRawTransaction(signedTx);
}
main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
