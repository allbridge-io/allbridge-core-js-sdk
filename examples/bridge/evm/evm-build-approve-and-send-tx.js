const { AllbridgeCoreSdk, ChainSymbol, Messenger } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const fromAddress = process.env.ETH_ACCOUNT_ADDRESS;
  // recipient address
  const toAddress = process.env.TRX_ACCOUNT_ADDRESS;

  // configure web3
  const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.GRL];
  const sourceTokenInfo = sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.rawTransactionBuilder.approve(web3, {
    tokenAddress: sourceTokenInfo.tokenAddress,
    owner: fromAddress,
    spender: sourceTokenInfo.poolAddress,
  });
  await sendRawTransaction(web3, rawTransactionApprove);

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
    web3
  );
  const txReceipt = await sendRawTransaction(web3, rawTransactionTransfer);
  console.log("Tokens sent:", txReceipt.transactionHash);
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
