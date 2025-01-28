import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  RawTronTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendTrxRawTransaction } from "../../../utils/tronWeb";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.TRX];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDT"));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "17.17";

  //check if sending tokens already approved
  if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount: amount }))) {
    // authorize the bridge to transfer tokens from sender's address
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: sourceToken,
      owner: fromAddress,
    })) as RawTronTransaction;
    const approveReceipt = await sendTrxRawTransaction(rawTransactionApprove);
    console.log("Approve transaction receipt", JSON.stringify(approveReceipt, null, 2));
  }

  // initiate transfer
  const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send({
    amount: amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
  })) as RawTronTransaction;

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
