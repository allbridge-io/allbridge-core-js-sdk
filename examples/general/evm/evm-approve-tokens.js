const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.WEB3_PROVIDER_URL;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const tokenAddress = process.env.ETH_TOKEN_ADDRESS;
  const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
  const poolAddress = process.env.ETH_POOL_ADDRESS;

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
