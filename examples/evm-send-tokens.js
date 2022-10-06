const {
  AllbridgeCoreSdk,
  ChainSymbol,
  development,
  Messenger,
} = require("@allbridge/allbridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config();

async function runExample() {
  const web3ProviderUrl = process.env.WEB3_PROVIDER_URL;
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const receiveTokenAddress = process.env.RECEIVE_TOKEN_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;

  const sendParams = {
    amount: "0x10A741A462780000", // 1.2 in 18 decimals dimension converted to hex OR you can use: // amount: "1200000000000000000" //

    fromChainSymbol: ChainSymbol.GRL,
    fromTokenAddress: tokenAddress,
    fromAccountAddress: accountAddress,

    toChainSymbol: ChainSymbol.RPS,
    toTokenAddress: receiveTokenAddress,
    toAccountAddress: accountAddress,

    messenger: Messenger.ALLBRIDGE,
    // fee: 2000000000000000,  //0.002 Ether - optional param
    // fee: 20000000000000000, //0.02 Ether - optional param
  };

  const web3 = new Web3(web3ProviderUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(development);

  const response = await sdk.send(web3, sendParams);
  console.log("evmSend response: ", response);
}

runExample();
