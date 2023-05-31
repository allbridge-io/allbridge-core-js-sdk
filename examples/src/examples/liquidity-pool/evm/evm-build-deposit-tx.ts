import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import { ensure } from "../../../utils/utils";
import { sendRawTransaction } from "../../../utils/web3";
dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");

  // configure web3
  const web3 = new Web3(getEnvVar("WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1";
  // create deposit raw transaction
  const rawTransactionDeposit = await sdk.pool.rawTxBuilder.deposit(
    {
      amount: oneToken,
      accountAddress: accountAddress,
      token: tokenInfo,
    },
    web3
  );

  const txReceipt = await sendRawTransaction(web3, rawTransactionDeposit);

  console.log("Token deposit:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
