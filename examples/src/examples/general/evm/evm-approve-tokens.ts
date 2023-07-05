import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import Web3 from "web3";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("WEB3_PROVIDER_URL");
  const privateKey = getEnvVar("ETH_PRIVATE_KEY");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const poolAddress = getEnvVar("ETH_POOL_ADDRESS");

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((t) => t.tokenAddress === tokenAddress));

  const approveData = {
    token: tokenInfo,
    owner: accountAddress,
  };
  const approveResponse = await sdk.bridge.approve(web3, approveData);
  console.log("approve response: ", approveResponse);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
