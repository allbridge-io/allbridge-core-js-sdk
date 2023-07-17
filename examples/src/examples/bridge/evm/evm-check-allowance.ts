import { AllbridgeCoreSdk, ChainSymbol, FeePaymentMethod, Messenger, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import Big from "big.js";

dotenv.config({ path: ".env" });
const main = async () => {
  // sender address
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  // configure web3
  const web3 = new Web3(getEnvVar("WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);
  const chains = await sdk.chainDetailsMap();
  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));
  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));
  const amountFloat = new Big("1.01");

  const gasFeePaymentMethod = FeePaymentMethod.WITH_STABLECOIN;
  // const gasFeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY;

  let totalAmountFloat;
  if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
    const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
    const gasFeeAmount = ensure(gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN]);
    const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
    // checking allowance for amount + gas fee
    totalAmountFloat = amountFloat.add(gasFeeAmountFloat);
  } else {
    // checking allowance for just amount
    totalAmountFloat = amountFloat;
  }

  if (
    // check if tokens already approved
    await sdk.bridge.checkAllowance(web3, {
      token: sourceTokenInfo,
      owner: fromAddress,
      gasFeePaymentMethod: gasFeePaymentMethod,
      amount: totalAmountFloat,
    })
  ) {
    console.log("The granted allowance is enough for the transaction");
  } else {
    console.log("The granted allowance is NOT enough for the transaction");
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
