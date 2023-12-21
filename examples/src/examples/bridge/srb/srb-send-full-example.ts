import Big from "big.js";
import {
  AllbridgeCoreSdk,
  AmountFormat,
  ChainSymbol,
  FeePaymentMethod,
  Messenger,
  nodeRpcUrlsDefault,
  SendParams,
  testnet,
} from "@allbridge/bridge-core-sdk";
import {
  Keypair,
  Keypair as StellarKeypair,
  SorobanRpc,
  TransactionBuilder as StellarTransactionBuilder,
  TransactionBuilder,
} from "stellar-sdk";
import { ensure } from "../../../utils/utils";
import { getEnvVar } from "../../../utils/env";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const fromAddress = getEnvVar("SRB_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SRB_PRIVATE_KEY");
const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chainDetailsMap = await sdk.chainDetailsMap();
  const sourceToken = ensure(chainDetailsMap[ChainSymbol.SRB].tokens.find((t) => t.symbol == "USDT"));
  const destinationToken = ensure(chainDetailsMap[ChainSymbol.ETH].tokens.find((t) => t.symbol == "USDT"));
  const amount = "2";
  const sendParams: SendParams = {
    amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken,
    destinationToken,
    messenger: Messenger.ALLBRIDGE,
    extraGas: "1.15",
    extraGasFormat: AmountFormat.FLOAT,
    gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
  };
  const xdrTx: string = (await sdk.bridge.rawTxBuilder.send(sendParams)) as string;

  //SignTx
  const srbKeypair = Keypair.fromSecret(privateKey);
  const transaction = TransactionBuilder.fromXDR(xdrTx, testnet.sorobanNetworkPassphrase);
  transaction.sign(srbKeypair);
  const signedTx = transaction.toXDR();

  const sent = await sdk.utils.srb.sendTransactionSoroban(signedTx);
  const confirm = await sdk.utils.srb.confirmTx(sent.hash);
  if (confirm.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    console.log(
      `Waited for transaction to complete, but it did not. ` +
        `Check the transaction status manually. ` +
        `Hash: ${sent.hash}`
    );
  } else if (confirm.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    console.log(`Transaction failed. Check the transaction manually.` + `Hash: ${sent.hash}`);
  } else {
    console.log(`Transaction Confirmed. Hash: ${sent.hash}`);
  }

  //TrustLine check and Set up for destinationToken if it is SRB
  const destinationTokenSBR = sourceToken; // simulate destination is srb

  const balanceLine = await sdk.utils.srb.getBalanceLine(fromAddress, destinationTokenSBR.tokenAddress);
  console.log(`BalanceLine:`, balanceLine);
  const notEnoughBalanceLine = !balanceLine || Big(balanceLine.balance).add(amount).gt(Big(balanceLine.limit));
  if (notEnoughBalanceLine) {
    const xdrTx = await sdk.utils.srb.buildChangeTrustLineXdrTx({
      sender: fromAddress,
      tokenAddress: destinationTokenSBR.tokenAddress,
      // limit: "1000000",
    });

    //SignTx
    const keypair = StellarKeypair.fromSecret(privateKey);
    const transaction = StellarTransactionBuilder.fromXDR(xdrTx, testnet.sorobanNetworkPassphrase);
    transaction.sign(keypair);
    const signedTrustLineTx = transaction.toXDR();

    const submit = await sdk.utils.srb.submitTransactionStellar(signedTrustLineTx);
    console.log("Submitted change trust tx. Hash:", submit.hash);
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
