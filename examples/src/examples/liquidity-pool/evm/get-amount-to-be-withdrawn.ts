import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import Web3 from "web3";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  const providerUrl = getEnvVar("WEB3_PROVIDER_URL");
  const privateKey = getEnvVar("ETH_PRIVATE_KEY");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const halfToken = "0.5";
  const estimatedAmount = await sdk.pool.getAmountToBeWithdrawn(halfToken, accountAddress, tokenInfo, web3);

  console.log("If you withdraw %d LP tokens, then %d will be received", halfToken, estimatedAmount);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
