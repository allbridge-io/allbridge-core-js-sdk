const { AllbridgeCoreSdk, ChainSymbol, Messenger, FeePaymentMethod } = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
const Big = require("big.js");
require("dotenv").config({ path: "../../.env" });

async function runExample() {
  // sender address
  const fromAddress = process.env.ETH_ACCOUNT_ADDRESS;

  // configure web3
  const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();
  const chains = await sdk.chainDetailsMap();
  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");
  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT");
  const amountFloat = new Big("1.01");

  const isPayWithStablecoinSupported = sourceTokenInfo.stablePayAddress !== undefined;
  const gasFeePaymentMethod = isPayWithStablecoinSupported
    ? FeePaymentMethod.WITH_STABLECOIN
    : FeePaymentMethod.WITH_NATIVE_CURRENCY;

  let totalAmountFloat;
  if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
    const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
    const gasFeeAmount = gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN];
    const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
    // checking allowance for amount + gas fee
    totalAmountFloat = amountFloat.add(gasFeeAmountFloat);
  } else {
    // checking allowance for just amount
    totalAmountFloat = amountFloat;
  }

  if (
    // check if tokens already approved
    await sdk.checkAllowance(web3, {
      tokenInfo: sourceTokenInfo,
      owner: fromAddress,
      gasFeePaymentMethod: gasFeePaymentMethod,
      amount: totalAmountFloat,
    })
  ) {
    console.log("The granted allowance is enough for the transaction");
  } else {
    console.log("The granted allowance is NOT enough for the transaction");
  }
}

runExample();
