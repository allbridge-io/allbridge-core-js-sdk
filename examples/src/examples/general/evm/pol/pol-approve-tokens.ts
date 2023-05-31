import { AllbridgeCoreSdk, ChainSymbol, Messenger, testnet } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";

import * as dotenv from "dotenv";
import { getEnvVar } from "../../../../utils/env";
import { ensure } from "../../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("POL_WEB3_PROVIDER_URL");
  const privateKey = getEnvVar("POL_PRIVATE_KEY");
  const tokenAddress = getEnvVar("POL_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("POL_ACCOUNT_ADDRESS");
  const poolAddress = getEnvVar("POL_POOL_ADDRESS");

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
