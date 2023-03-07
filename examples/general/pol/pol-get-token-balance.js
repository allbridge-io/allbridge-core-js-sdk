const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.POL_WEB3_PROVIDER_URL;
  const privateKey = process.env.POL_PRIVATE_KEY;
  const tokenAddress = process.env.POL_TOKEN_ADDRESS;
  const accountAddress = process.env.POL_ACCOUNT_ADDRESS;

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);
  const tokenDecimals = tokenInfo.decimals;
  console.log("tokenInfo.chainSymbol:", tokenInfo.chainSymbol);
  const tokenBalanceData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
  };
  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData, web3);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    tokenAddress: tokenAddress,
    tokenDecimals: tokenDecimals,
  };
  const tokenBalanceWithPrecision = await sdk.getTokenBalance(tokenBalanceWithPrecisionData, web3);
  console.log("With precision:", tokenBalanceWithPrecision);
}

runExample();
