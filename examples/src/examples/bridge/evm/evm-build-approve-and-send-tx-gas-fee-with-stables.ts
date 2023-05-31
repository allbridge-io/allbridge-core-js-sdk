import { AllbridgeCoreSdk, ChainSymbol, FeePaymentMethod, Messenger, testnet } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { sendRawTransaction } from "../../../utils/web3";
import Big from "big.js";
import { ensure } from "../../../utils/utils";
dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  // recipient address
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  // configure web3
  const web3 = new Web3(getEnvVar("GRL_WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(testnet);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.GRL];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const destinationChain = chains[ChainSymbol.SPL];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const amountToSendFloat = "5";
  const gasFeeOptions = await sdk.getGasFeeOptions(sourceTokenInfo, destinationTokenInfo, Messenger.ALLBRIDGE);
  const gasFeeAmount = ensure(gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN]);

  // authorize the bridge to transfer tokens from sender's address
  const rawTransactionApprove = await sdk.bridge.rawTxBuilder.approve(web3, {
    token: sourceTokenInfo,
    owner: fromAddress,
  });
  const approveTxReceipt = await sendRawTransaction(web3, rawTransactionApprove);
  console.log("approve tx id:", approveTxReceipt.transactionHash);

  const gasFeeAmountFloat = new Big(gasFeeAmount).div(new Big(10).pow(sourceTokenInfo.decimals));
  const totalAmountFloat = new Big(amountToSendFloat).add(gasFeeAmountFloat).toFixed();
  console.log(
    `Sending ${amountToSendFloat} ${sourceTokenInfo.symbol} (gas fee ${gasFeeAmountFloat} ${sourceTokenInfo.symbol}). Total amount: ${totalAmountFloat} ${sourceTokenInfo.symbol}`
  );

  // initiate transfer
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(
    {
      amount: totalAmountFloat,
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceToken: sourceTokenInfo,
      destinationToken: destinationTokenInfo,
      messenger: Messenger.ALLBRIDGE,
      gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
      fee: gasFeeAmount,
    },
    web3
  );

  const txReceipt = await sendRawTransaction(web3, rawTransactionTransfer);
  console.log("tx id:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
