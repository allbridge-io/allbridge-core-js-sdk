const { AllbridgeCoreSdk } = require("..");
const configs = require("../build/src/configs");
const Web3 = require("web3");
const { Messenger } = require("../build/src/client/core-api/core-api.model");
const { ChainSymbol } = require("../build/src/chains");
require("dotenv").config();

async function runExample() {
  const web3ProviderUrl = process.env.WEB3_PROVIDER_URL;
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const receiveTokenAddress = process.env.RECEIVE_TOKEN_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;

  const sendParams = {
    amount: "0x10A741A462780000", //amount: 1200000000000000000 // 1.2 in 18 decimals dimension converted to hex

    fromChainSymbol: ChainSymbol.GRL,
    fromTokenAddress: tokenAddress,
    fromAccountAddress: accountAddress,

    toChainSymbol: ChainSymbol.RPS,
    toTokenAddress: receiveTokenAddress,
    toAccountAddress: accountAddress,

    messenger: Messenger.ALLBRIDGE,
    // fee: 2000000000000000, //TODO //0.002 Ether
    // fee: 20000000000000000, //TODO //0.02 Ether
  };

  const web3 = new Web3(web3ProviderUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(configs.development);

  const response = await sdk.send(web3, sendParams);
  console.log("evmSend response: ", response);
}

runExample();
