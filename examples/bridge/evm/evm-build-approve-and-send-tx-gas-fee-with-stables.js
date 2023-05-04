const { AllbridgeCoreSdk, ChainSymbol, Messenger, FeePaymentMethod } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
const Big = require("big.js");
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

  const sourceChain = chains[ChainSymbol.BSC];
  const sourceTokenInfo = sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");

  const amountToSendFloat = "1.01";
  const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
  const gasFeeAmount = gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN];

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.rawTransactionBuilder.approve(web3, {
    token: sourceTokenInfo,
    owner: fromAddress,
    spender: sourceTokenInfo.bridgeAddress,
  });
  const approveTxReceipt = await sendRawTransaction(web3, rawTransactionApprove);
  console.log("approve tx id:", approveTxReceipt.transactionHash);

  const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
  const totalAmountFloat = new Big(amountToSendFloat).add(gasFeeAmountFloat).toFixed();
  console.log(
    `Sending ${amountToSendFloat} ${sourceTokenInfo.symbol} (gas fee ${gasFeeAmountFloat} ${sourceTokenInfo.symbol}). Total amount: ${totalAmountFloat} ${sourceTokenInfo.symbol}`
  );

  // initiate transfer
  const rawTransactionTransfer = await sdk.rawTransactionBuilder.send(
    {
      amount: totalAmountFloat,
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceChainToken: sourceTokenInfo,
      destinationChainToken: destinationTokenInfo,
      messenger: Messenger.ALLBRIDGE,
      gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
      fee: gasFeeAmount,
    },
    web3
  );

  const txReceipt = await sendRawTransaction(web3, rawTransactionTransfer);
  console.log("tx id:", txReceipt.transactionHash);
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
