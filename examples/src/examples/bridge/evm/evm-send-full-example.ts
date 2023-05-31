import { AllbridgeCoreSdk, ChainSymbol, Messenger } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });
const main = async () => {
  // sender address
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  // recipient address
  const toAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  // configure web3
  const web3 = new Web3(getEnvVar("WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();

  // fetch information about supported chains
  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.BSC];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "BUSD"));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  if (
    //check if sending tokens already approved
    !(await sdk.bridge.checkAllowance(web3, {
      token: sourceTokenInfo,
      owner: fromAddress,
      amount: "1.01",
    }))
  ) {
    // authorize a transfer of tokens from sender's address
    await sdk.bridge.approve(web3, {
      token: sourceTokenInfo,
      owner: fromAddress,
    });
  }

  // initiate transfer
  const response = await sdk.bridge.send(web3, {
    amount: "1.01",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    messenger: Messenger.ALLBRIDGE,
  });
  console.log("Tokens sent:", response.txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
