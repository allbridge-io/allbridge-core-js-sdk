import { AllbridgeCoreSdk, ChainSymbol, Messenger, nodeUrlsDefault, RawTransaction } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
// @ts-expect-error import tron
import TronWeb from "tronweb";

dotenv.config({ path: ".env" });
const main = async () => {
  // sender address
  const fromAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  // recipient address
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

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
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.bridge.rawTxBuilder.approve(tronWeb, {
    token: sourceTokenInfo,
    owner: fromAddress,
  });
  const approveReceipt = await sendRawTransaction(tronWeb, rawTransactionApprove);
  console.log("Approve transaction receipt", JSON.stringify(approveReceipt, null, 2));

  // initiate transfer
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(
    {
      amount: "17",
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceToken: sourceTokenInfo,
      destinationToken: destinationTokenInfo,
      messenger: Messenger.ALLBRIDGE,
    },
    tronWeb
  );

  const transferReceipt = await sendRawTransaction(tronWeb, rawTransactionTransfer);
  console.log("Transfer tokens transaction receipt:", transferReceipt);
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
