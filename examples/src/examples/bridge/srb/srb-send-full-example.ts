import Big from "big.js";
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  mainnet,
  Messenger,
  nodeUrlsDefault,
  SendParams,
} from "@allbridge/bridge-core-sdk";
import * as SorobanClient from "soroban-client";
import { SorobanRpc, TransactionBuilder } from "soroban-client";
import { Keypair as StellarKeypair, TransactionBuilder as StellarTransactionBuilder } from "stellar-sdk";
import { ensure } from "../../../utils/utils";
import { getEnvVar } from "../../../utils/env";

const fromAddress = getEnvVar("SRB_ACCOUNT_ADDRESS");
const privateKey = getEnvVar("SRB_PRIVATE_KEY");
const toAddress = getEnvVar("ETH_ACCOUNT_ADDRESS");

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chainDetailsMap = await sdk.chainDetailsMap();
  const sourceToken = ensure(chainDetailsMap[ChainSymbol.SRB].tokens.find((t) => t.symbol == "USDC"));
  const destinationToken = ensure(chainDetailsMap[ChainSymbol.ETH].tokens.find((t) => t.symbol == "USDC"));

  const amount = "1";
  const sendParams: SendParams = {
    amount,
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceToken,
    destinationToken,
    messenger: Messenger.ALLBRIDGE,
  };
  const xdrTx: string = (await sdk.bridge.rawTxBuilder.send(sendParams)) as string;

  //SignTx
  const srbKeypair = SorobanClient.Keypair.fromSecret(privateKey);
  const transaction = TransactionBuilder.fromXDR(xdrTx, mainnet.sorobanNetworkPassphrase);
  transaction.sign(srbKeypair);
  const signedTx = transaction.toXDR();
  //

  const sent = await sdk.utils.srb.sendTransactionSoroban(signedTx);
  const confirm = await sdk.utils.srb.confirmTx(sent.hash);
  if (confirm.status === SorobanRpc.GetTransactionStatus.NOT_FOUND) {
    console.log(
      `Waited for transaction to complete, but it did not. ` +
        `Check the transaction status manually. ` +
        `Hash: ${sent.hash}`
    );
  } else if (confirm.status === SorobanRpc.GetTransactionStatus.FAILED) {
    console.log(`Transaction failed. Check the transaction manually.` + `Hash: ${sent.hash}`);
  } else {
    console.log(`Transaction Confirmed. Hash: ${sent.hash}`);
  }

  //TrustLine check and Set up for destinationToken if it is SRB
  const destinationTokenSBR = sourceToken; // simulate destination is srb
  const toAddressSBR = fromAddress; // simulate destination is srb
  const balanceLine = await sdk.utils.srb.getBalanceLine(toAddressSBR, destinationTokenSBR.tokenAddress);
  console.log(`BalanceLine:`, balanceLine);
  if (!balanceLine || Big(balanceLine.balance).add(amount).gt(Big(balanceLine.limit))) {
    const xdrTx = await sdk.utils.srb.buildChangeTrustLineXdrTx({
      sender: toAddressSBR,
      tokenAddress: destinationTokenSBR.tokenAddress,
    });

    //SignTx
    const transaction = StellarTransactionBuilder.fromXDR(xdrTx, mainnet.sorobanNetworkPassphrase);
    const keypair = StellarKeypair.fromSecret(privateKey);
    transaction.sign(keypair);
    const signedTrustLineTx = transaction.toXDR();
    //

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
