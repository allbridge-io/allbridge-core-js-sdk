const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../.env" });

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
  const sourceTokenInfo = sourceChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDT"
  );

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationTokenInfo = destinationChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDT"
  );

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.rawTransactionBuilder.approve(
    tronWeb,
    {
      tokenAddress: sourceTokenInfo.tokenAddress,
      owner: fromAddress,
      spender: sourceTokenInfo.poolAddress,
    }
  );
  const approveReceipt = await sendRawTransaction(
    tronWeb,
    rawTransactionApprove
  );
  console.log(
    "Approve transaction receipt",
    JSON.stringify(approveReceipt, null, 2)
  );

  // initiate transfer
  const rawTransactionTransfer = await sdk.rawTransactionBuilder.send(
    {
      amount: "1.01",
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceChainToken: sourceTokenInfo,
      destinationChainToken: destinationTokenInfo,
      messenger: Messenger.ALLBRIDGE,
    },
    tronWeb
  );

  const transferReceipt = await sendRawTransaction(
    tronWeb,
    rawTransactionTransfer
  );
  console.log("Transfer tokens transaction receipt:", transferReceipt);
}

async function sendRawTransaction(tronWeb, rawTransaction) {
  console.log("rawTransaction:", JSON.stringify(rawTransaction, null, 2));
  const signedTx = await tronWeb.trx.sign(rawTransaction);
  console.log("signedTx:", JSON.stringify(signedTx, null, 2));

  if (!signedTx.signature) {
    throw Error("Transaction was not signed properly");
  }

  // Broadcasting the transaction
  return await tronWeb.trx.sendRawTransaction(signedTx);
}

runExample();
