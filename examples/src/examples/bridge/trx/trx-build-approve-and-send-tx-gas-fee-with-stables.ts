import {
  AllbridgeCoreSdk,
  ChainSymbol,
  FeePaymentMethod,
  Messenger,
  nodeUrlsDefault,
  RawTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import Big from "big.js";

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
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.bridge.rawTxBuilder.approve(tronWeb, {
    token: sourceTokenInfo,
    owner: fromAddress,
  });
  const approveReceipt = await sendRawTransaction(tronWeb, rawTransactionApprove);
  console.log("Approve transaction receipt", JSON.stringify(approveReceipt, null, 2));

  const amountToSendFloat = "17";
  const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
  console.log("gasFeeOptions", gasFeeOptions);
  const gasFeeAmount = ensure(gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN]);
  const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
  const totalAmountFloat = new Big(amountToSendFloat).add(gasFeeAmountFloat).toFixed();
  console.log(
    `Sending ${amountToSendFloat} ${sourceTokenInfo.symbol} (gas fee ${gasFeeAmountFloat} ${sourceTokenInfo.symbol}). Total amount: ${totalAmountFloat} ${sourceTokenInfo.symbol}`
  );

  // initiate transfer
  const params = {
    amount: totalAmountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    messenger: Messenger.ALLBRIDGE,
    gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
    fee: gasFeeAmount,
  };
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(params, tronWeb);

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
