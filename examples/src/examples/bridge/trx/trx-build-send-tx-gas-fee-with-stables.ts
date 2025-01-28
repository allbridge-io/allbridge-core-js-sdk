import {
  AllbridgeCoreSdk,
  ChainSymbol,
  FeePaymentMethod,
  Messenger,
  nodeRpcUrlsDefault,
  RawTronTransaction,
} from "@allbridge/bridge-core-sdk";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import Big from "big.js";
import { sendTrxRawTransaction } from "../../../utils/tronWeb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.TRX];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  const amountToSendFloat = "17.187";

  //check if sending tokens already approved
  if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount: amountToSendFloat }))) {
    // authorize the bridge to transfer tokens from sender's address
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: sourceToken,
      owner: fromAddress,
    })) as RawTronTransaction;
    const approveReceipt = await sendTrxRawTransaction(rawTransactionApprove);
    console.log("Approve transaction receipt", JSON.stringify(approveReceipt, null, 2));
  }

  const gasFeeOptions = await sdk.getGasFeeOptions(sourceToken, destinationToken, Messenger.ALLBRIDGE);
  console.log("gasFeeOptions", gasFeeOptions);
  const gasFeeAmount = ensure(gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN]);
  const gasFeeAmountFloat = gasFeeAmount.float;
  const totalAmountFloat = new Big(amountToSendFloat).add(gasFeeAmountFloat).toFixed();
  console.log(
    `Sending ${amountToSendFloat} ${sourceToken.symbol} (gas fee ${gasFeeAmountFloat} ${sourceToken.symbol}). Total amount: ${totalAmountFloat} ${sourceToken.symbol}`
  );

  // initiate transfer
  const params = {
    amount: totalAmountFloat,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
    gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
    fee: gasFeeAmount.int,
  };
  const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send(params)) as RawTronTransaction;

  const transferReceipt = await sendTrxRawTransaction(rawTransactionTransfer);
  console.log("Transfer tokens transaction receipt:", transferReceipt);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
