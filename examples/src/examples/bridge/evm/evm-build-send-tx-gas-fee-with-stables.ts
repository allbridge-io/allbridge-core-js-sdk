import {
  AllbridgeCoreSdk,
  ChainSymbol,
  FeePaymentMethod,
  Messenger,
  nodeRpcUrlsDefault,
  RawEvmTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { sendEvmRawTransaction } from "../../../utils/web3";
import Big from "big.js";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // sender address
  const toAddress = getEnvVar("POL_ACCOUNT_ADDRESS"); // recipient address

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.POL];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "5.05";
  const gasFeeOptions = await sdk.getGasFeeOptions(sourceToken, destinationToken, Messenger.ALLBRIDGE);
  const gasFeeAmount = ensure(gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN]);

  const gasFeeAmountFloat = gasFeeAmount.float;
  const totalAmountFloat = new Big(amount).add(gasFeeAmountFloat).toFixed();

  //check if sending tokens already approved
  if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount: totalAmountFloat }))) {
    // authorize the bridge to transfer tokens from sender's address
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: sourceToken,
      owner: fromAddress,
    })) as RawEvmTransaction;
    const approveTxReceipt = await sendEvmRawTransaction(rawTransactionApprove);
    console.log("approve tx id:", approveTxReceipt.transactionHash);
  }

  // initiate transfer
  const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send({
    amount: totalAmountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
    gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
    fee: gasFeeAmount.int,
  })) as RawEvmTransaction;
  console.log(
    `Sending ${amount} ${sourceToken.symbol} (gas fee ${gasFeeAmountFloat} ${sourceToken.symbol}). Total amount: ${totalAmountFloat} ${sourceToken.symbol}`
  );
  const txReceipt = await sendEvmRawTransaction(rawTransactionTransfer);
  console.log("tx id:", txReceipt.transactionHash);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
