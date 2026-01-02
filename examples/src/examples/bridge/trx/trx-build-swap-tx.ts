import {
  AllbridgeCoreSdk,
  ChainSymbol,
  nodeRpcUrlsDefault,
  RawTronTransaction,
  SwapParams,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendTrxRawTransaction } from "../../../utils/tronWeb";

dotenv.config({ path: ".env" });

const main = async () => {
  const fromAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");
  const toAddress = getEnvVar("TRX_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.TRX];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "10";

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
  const swapParams: SwapParams = {
    amount: amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    minimumReceiveAmount: await sdk.getAmountToBeReceived(amount, sourceToken, destinationToken),
  };
  const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send(swapParams)) as RawTronTransaction;

  console.log(`Sending ${amount} ${sourceToken.symbol}`);
  const txReceipt = await sendTrxRawTransaction(rawTransactionTransfer);
  console.log("txReceipt:", txReceipt);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
