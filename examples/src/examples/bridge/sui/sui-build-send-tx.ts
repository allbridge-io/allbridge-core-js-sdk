import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  RawSuiTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { ensure } from "../../../utils/utils";
import { sendSuiRawTransaction } from "../../../utils/sui";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("SUI_ACCOUNT_ADDRESS");
  const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // recipient address

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SUI];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.ETH];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "100";

  // initiate transfer
  const xdr = (await sdk.bridge.rawTxBuilder.send({
    amount: amount,
    fromAccountAddress: accountAddress,
    toAccountAddress: toAddress,
    sourceToken: sourceToken,
    destinationToken: destinationToken,
    messenger: Messenger.ALLBRIDGE,
    // gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
  })) as RawSuiTransaction;

  const txReceipt = await sendSuiRawTransaction(xdr);
  console.log("tx id:", txReceipt);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
