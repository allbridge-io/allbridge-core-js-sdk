const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config();

async function runExample() {
  const providerUrl = process.env.PROVIDER_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const accountAddress = process.env.ACCOUNT_ADDRESS;
  const poolAddress = process.env.POOL_ADDRESS;

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const approveData = {
    tokenAddress: tokenAddress,
    owner: accountAddress,
    spender: poolAddress,
  };
  const approveResponse = await sdk.approve(web3, approveData);
  console.log("approve response: ", approveResponse);
}

runExample();
