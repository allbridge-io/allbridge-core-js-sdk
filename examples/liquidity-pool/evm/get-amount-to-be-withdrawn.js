const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  const providerUrl = process.env.WEB3_PROVIDER_URL;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const tokenAddress = process.env.ETH_TOKEN_ADDRESS;
  const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const halfToken = 0.5;
  const estimatedAmount = await sdk.getAmountToBeWithdrawn(halfToken, accountAddress, tokenInfo, web3);

  console.log("If you withdraw %d LP tokens, then %d will be received", halfToken, estimatedAmount);
}

runExample();
