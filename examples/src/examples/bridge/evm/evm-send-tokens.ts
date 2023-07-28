import { AllbridgeCoreSdk, ChainSymbol, Messenger, nodeUrlsDefault, SendParams } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });
const main = async () => {
  const providerUrl = getEnvVar("WEB3_PROVIDER_URL");
  const accountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const toAccountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const receiveTokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const privateKey = getEnvVar("ETH_PRIVATE_KEY");

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(
    destinationChain.tokens.find((tokenInfo) => tokenInfo.tokenAddress === receiveTokenAddress)
  );

  const sendParams: SendParams = {
    amount: "1.33",
    fromAccountAddress: accountAddress,
    toAccountAddress: toAccountAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    messenger: Messenger.ALLBRIDGE,

    // fee: 2000000000000000,  //0.002 Ether - optional param
    // fee: 20000000000000000, //0.02 Ether - optional param
  };

  const response = await sdk.bridge.send(web3, sendParams);
  console.log("evmSend response: ", response);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
