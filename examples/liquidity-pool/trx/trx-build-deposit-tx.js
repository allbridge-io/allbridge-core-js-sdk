const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;

  // configure TronWeb
  const tronWeb = new TronWeb(
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRONWEB_PROVIDER_URL,
    process.env.TRX_PRIVATE_KEY
  );

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const oneToken = 1;
  // create deposit raw transaction
  const rawTransactionDeposit = await sdk.rawTransactionBuilder.deposit(
    {
      amount: oneToken,
      accountAddress: accountAddress,
      token: tokenInfo,
    },
    tronWeb
  );

  const txReceipt = await sendRawTransaction(tronWeb, rawTransactionDeposit);

  console.log("Token deposit:", txReceipt.txid);
}

async function sendRawTransaction(tronWeb, rawTransaction) {
  const signedTx = await tronWeb.trx.sign(rawTransaction);

  if (!signedTx.signature) {
    throw Error("Transaction was not signed properly");
  }

  // Broadcasting the transaction
  return tronWeb.trx.sendRawTransaction(signedTx);
}

runExample();
