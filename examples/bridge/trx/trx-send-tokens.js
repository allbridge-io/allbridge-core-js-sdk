const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const TronWeb = require("tronweb");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.TRONWEB_PROVIDER_URL;
  const accountAddress = process.env.TRX_ACCOUNT_ADDRESS;
  const toAccountAddress = process.env.ETH_ACCOUNT_ADDRESS;
  const tokenAddress = process.env.TRX_TOKEN_ADDRESS;
  const receiveTokenAddress = process.env.ETH_TOKEN_ADDRESS;
  const privateKey = process.env.TRX_PRIVATE_KEY;

  const sendParams = {
    amount: "0.7",

    fromChainSymbol: ChainSymbol.TRX,
    fromTokenAddress: tokenAddress,
    fromAccountAddress: accountAddress,

    toChainSymbol: ChainSymbol.ETH,
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
