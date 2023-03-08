const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
  const tokenAddress = process.env.ETH_TOKEN_ADDRESS;

  // configure web3
  const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

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
    web3
  );

  const txReceipt = await sendRawTransaction(web3, rawTransactionDeposit);

  console.log("Token deposit:", txReceipt.transactionHash);
}

async function sendRawTransaction(web3, rawTransaction) {
  const gasLimit = await web3.eth.estimateGas(rawTransaction);
  const account = web3.eth.accounts.wallet[rawTransaction.from];
  const createTxReceipt = await account.signTransaction({
    ...rawTransaction,
    gas: gasLimit,
  });
  return web3.eth.sendSignedTransaction(createTxReceipt.rawTransaction);
}

runExample();
