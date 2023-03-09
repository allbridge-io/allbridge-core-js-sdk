const { AllbridgeCoreSdk } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../../.env" });

async function runEvmExample() {
  const providerUrl = process.env.WEB3_PROVIDER_URL;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const tokenAddress = process.env.ETH_TOKEN_ADDRESS;
  const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = (await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress);

  const userBalanceInfo = await sdk.getLiquidityBalanceInfo(accountAddress, tokenInfo, web3);
  const poolInfo = await sdk.getPoolInfo(tokenInfo, web3);

  console.log("Evm User balance: ", userBalanceInfo.userLiquidity);
  console.log("Evm User rewards: ", userBalanceInfo.earned(poolInfo, tokenInfo.decimals));
  console.log("Evm Pool APR: ", sdk.aprInPercents(tokenInfo.apr));
}

runEvmExample();
