const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../../.env" });

async function runExample() {
  const providerUrl = process.env.BSC_WEB3_PROVIDER_URL;
  const privateKey = process.env.BSC_PRIVATE_KEY;
  const tokenAddress = process.env.BSC_TOKEN_ADDRESS;
  const accountAddress = process.env.BSC_ACCOUNT_ADDRESS;
  const poolAddress = process.env.BSC_POOL_ADDRESS;

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
