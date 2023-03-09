const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const accountAddress = process.env.SOL_ACCOUNT_ADDRESS;
  const privateKey = process.env.SOL_PRIVATE_KEY;
  const tokenAddress = process.env.SOL_TOKEN_ADDRESS;

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  // create claim rewards raw transaction
  const transaction = await sdk.rawTransactionBuilder.claimRewards({
    accountAddress: accountAddress,
    token: tokenInfo,
  });

  const tx = await sendRawTransaction(transaction, privateKey, sdk);

  console.log("Token claim rewards:", tx);
}

async function sendRawTransaction(transaction, privateKey, sdk) {
  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  let connection = new solanaWeb3.Connection(sdk.params.solanaRpcUrl, "confirmed");
  return await sendAndConfirmTransaction(connection, transaction, [keypair]);
}

runExample();
