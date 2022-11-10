const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../.env" });

async function runExample() {
  const providerUrl = process.env.WEB3_PROVIDER_URL;
  const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
  const toAccountAddress = process.env.TRX_ACCOUNT_ADDRESS;
  const tokenAddress = process.env.ETH_TOKEN_ADDRESS;
  const receiveTokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const privateKey = process.env.ETH_PRIVATE_KEY;

  const sendParams = {
    amount: "1.33",

    fromChainSymbol: ChainSymbol.ETH,
    fromTokenAddress: tokenAddress,
    fromAccountAddress: accountAddress,

    toChainSymbol: ChainSymbol.TRX,
    toTokenAddress: receiveTokenAddress,
    toAccountAddress: toAccountAddress,

    messenger: Messenger.ALLBRIDGE,
    // fee: 2000000000000000,  //0.002 Ether - optional param
    // fee: 20000000000000000, //0.02 Ether - optional param
  };

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();

  const response = await sdk.send(web3, sendParams);
  console.log("evmSend response: ", response);
}

runExample();
