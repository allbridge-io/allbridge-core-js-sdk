import { AllbridgeCoreSdk, ChainSymbol, Messenger, testnet } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { sendRawTransaction } from "../../../utils/web3";
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

  // const sdk = new AllbridgeCoreSdk();
  const sdk = new AllbridgeCoreSdk(testnet);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "YARO"));

  const amount = "1.01";

  // authorize the bridge to transfer tokens from sender's address
  // const rawTransactionApprove = await sdk.bridge.buildRawTransactionApprove(web3, {
  const rawTransactionApprove = await sdk.bridge.rawTxBuilder.approve(web3, {
    token: sourceTokenInfo,
    owner: fromAddress,
  });
  const approveTxReceipt = await sendRawTransaction(web3, rawTransactionApprove);
  console.log("approve tx id:", approveTxReceipt.transactionHash);

  // initiate transfer
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(
    {
      amount: amount,
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceToken: sourceTokenInfo,
      destinationToken: destinationTokenInfo,
      messenger: Messenger.ALLBRIDGE,
    },
    web3
  );
  console.log(`Sending ${amount} ${sourceTokenInfo.symbol}`);
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
