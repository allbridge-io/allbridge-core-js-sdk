import { AllbridgeCoreSdk, ChainSymbol, nodeUrlsDefault, SwapParams } from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { sendRawTransaction } from "../../../utils/web3";
import { ensure } from "../../../utils/utils";
import { TransactionConfig } from "web3-core";

dotenv.config({ path: ".env" });
const main = async () => {
  // sender address
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");
  // recipient address
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  // configure web3
  const web3 = new Web3(getEnvVar("WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceTokenInfo = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationTokenInfo = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "10";

  // initiate transfer
  const swapParams: SwapParams = {
    amount: amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceTokenInfo,
    destinationToken: destinationTokenInfo,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceTokenInfo, destinationTokenInfo),
  };
  const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(swapParams, web3);

  console.log(`Swaping ${amount} ${sourceTokenInfo.symbol}`);
  const txReceipt = await sendRawTransaction(web3, rawTransactionTransfer as TransactionConfig);
  console.log("tx id:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
