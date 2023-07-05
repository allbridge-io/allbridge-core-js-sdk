import { AllbridgeCoreSdk, ChainSymbol, Messenger, SendParams } from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
// @ts-expect-error import tron
import * as TronWeb from "tronweb";

dotenv.config({ path: ".env" });
const main = async () => {
  const providerUrl = getEnvVar("TRONWEB_PROVIDER_URL");
  const accountAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const toAccountAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("TRX_TOKEN_ADDRESS");
  const receiveTokenAddress = getEnvVar("ETH_TOKEN_ADDRESS");
  const privateKey = getEnvVar("TRX_PRIVATE_KEY");

  const tronWeb = new TronWeb(providerUrl, providerUrl, providerUrl, privateKey);

  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(
    destinationChain.tokens.find((tokenInfo) => tokenInfo.tokenAddress === receiveTokenAddress)
  );

  const sendParams: SendParams = {
    amount: "0.7",

    sourceToken: sourceTokenInfo,
    fromAccountAddress: accountAddress,

    destinationToken: destinationTokenInfo,
    toAccountAddress: toAccountAddress,

    messenger: Messenger.ALLBRIDGE,
    // fee: 2000000000000000,  //0.002 Ether - optional param
    // fee: 20000000000000000, //0.02 Ether - optional param
  };

  const response = await sdk.bridge.send(tronWeb, sendParams);
  console.log("tron send response: ", response);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
