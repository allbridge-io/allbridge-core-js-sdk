import * as dotenv from "dotenv";
import Web3 from "web3";
import { getEnvVar } from "../../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("BSC_WEB3_PROVIDER_URL");
  const privateKey = getEnvVar("BSC_PRIVATE_KEY");
  const tokenAddress = getEnvVar("BSC_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("BSC_ACCOUNT_ADDRESS");

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));
  const tokenDecimals = tokenInfo.decimals;

  const tokenBalanceData = {
    account: accountAddress,
    tokenInfo: tokenInfo,
  };
  const tokenBalance = await sdk.bridge.getTokenBalance(tokenBalanceData, web3);
  console.log("Token Balance: ", tokenBalance);

  const tokenBalanceWithPrecisionData = {
    account: accountAddress,
    tokenInfo: tokenInfo,
  };
  const tokenBalanceWithPrecision = await sdk.bridge.getTokenBalance(tokenBalanceWithPrecisionData, web3);
  console.log("With precision:", tokenBalanceWithPrecision);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
