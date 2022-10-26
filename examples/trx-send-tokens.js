const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
const Web3 = require("web3");
require("dotenv").config();

async function runExample() {
  const providerUrl = process.env.PROVIDER_URL;
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const toAccountAddress = process.env.TO_ACCOUNT_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const receiveTokenAddress = process.env.RECEIVE_TOKEN_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;

  const sendParams = {
    amount: "0.7",

    fromChainSymbol: ChainSymbol.TRX,
    fromTokenAddress: tokenAddress,
    fromAccountAddress: accountAddress,

    toChainSymbol: ChainSymbol.GRL,
    toTokenAddress: receiveTokenAddress,
    toAccountAddress: toAccountAddress,

    messenger: Messenger.ALLBRIDGE,
    // fee: 2000000000000000,  //0.002 Ether - optional param
    // fee: 20000000000000000, //0.02 Ether - optional param
  };

  const tronWeb = new TronWeb(
    providerUrl,
    providerUrl,
    providerUrl,
    privateKey
  );

  const sdk = new AllbridgeCoreSdk();

  const response = await sdk.send(tronWeb, sendParams);
  console.log("tron send response: ", response);
}

runExample();
