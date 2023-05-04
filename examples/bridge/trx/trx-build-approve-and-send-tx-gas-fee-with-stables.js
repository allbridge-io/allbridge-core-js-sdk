const { AllbridgeCoreSdk, ChainSymbol, Messenger, FeePaymentMethod } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
const Big = require("big.js");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const fromAddress = process.env.TRX_ACCOUNT_ADDRESS;
  // recipient address
  const toAddress = process.env.ETH_ACCOUNT_ADDRESS;

  // configure TronWeb
  const tronWeb = new TronWeb(
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRX_PRIVATE_KEY
  );
  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.TRX];
  const sourceTokenInfo = sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationTokenInfo = destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.rawTransactionBuilder.approve(tronWeb, {
    token: sourceTokenInfo,
    owner: fromAddress,
    spender: sourceTokenInfo.bridgeAddress,
  });
  const approveReceipt = await sendRawTransaction(tronWeb, rawTransactionApprove);
  console.log("Approve transaction receipt", JSON.stringify(approveReceipt, null, 2));

  const amountToSendFloat = "17";
  const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
  console.log("gasFeeOptions", gasFeeOptions);
  const gasFeeAmount = gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN];
  const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
  const totalAmountFloat = new Big(amountToSendFloat).add(gasFeeAmountFloat).toFixed();
  console.log(
    `Sending ${amountToSendFloat} ${sourceTokenInfo.symbol} (gas fee ${gasFeeAmountFloat} ${sourceTokenInfo.symbol}). Total amount: ${totalAmountFloat} ${sourceTokenInfo.symbol}`
  );

  // initiate transfer
  let params = {
    amount: totalAmountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceChainToken: sourceTokenInfo,
    destinationChainToken: destinationTokenInfo,
    messenger: Messenger.ALLBRIDGE,
    gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
    fee: gasFeeAmount,
  };
  const rawTransactionTransfer = await sdk.rawTransactionBuilder.send(params, tronWeb);

  const transferReceipt = await sendRawTransaction(tronWeb, rawTransactionTransfer);
  console.log("Transfer tokens transaction receipt:", transferReceipt);
}

async function sendRawTransaction(tronWeb, rawTransaction) {
  const signedTx = await tronWeb.trx.sign(rawTransaction);

  if (!signedTx.signature) {
    throw Error("Transaction was not signed properly");
  }

  // Broadcasting the transaction
  return await tronWeb.trx.sendRawTransaction(signedTx);
}

runExample();
