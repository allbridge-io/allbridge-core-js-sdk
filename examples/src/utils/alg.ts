import { RawAlgTransaction } from "@allbridge/bridge-core-sdk";
import { getEnvVar } from "./env";
import algosdk, { Account, Algodv2, Transaction } from "algosdk";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

// import { packResources } from "./alg-pack-resources";

export async function sendAlgRawTransaction(rawTransaction: RawAlgTransaction): Promise<string> {
  console.log("Sending Alg Raw Transaction");
  const nodeRpcUrl = getEnvVar("ALG_PROVIDER_URL");
  const privateKey = getEnvVar("ALG_PRIVATE_KEY");

  const mnemonic = algosdk.secretKeyToMnemonic(Buffer.from(privateKey, "hex"));
  const signer = algosdk.mnemonicToSecretKey(mnemonic);
  console.log("Signer", signer.addr.toString());

  const algorand = AlgorandClient.fromConfig({
    algodConfig: { server: nodeRpcUrl },
  });
  const algod = algorand.client.algod;

  const txns: Transaction[] = rawTransaction.map((hex) => {
    const bytes = Buffer.from(hex, "hex");
    return algosdk.decodeUnsignedTransaction(bytes);
  });

  return simpleSend(txns, signer, algod);

  // const atc = new AtomicTransactionComposer();
  // const txnSigner = makeBasicAccountTransactionSigner(signer); // signs only the indices it’s asked to
  // txns.forEach((txn) => {
  //   atc.addTransaction({ txn, signer: txnSigner });
  // });

  // return populateAndSend(atc, algod);
  // return customPackAndSend(atc, algod);
}

async function simpleSend(txns: Transaction[], signer: Account, algod: Algodv2): Promise<string> {
  const alreadyGrouped = txns.every((t) => t.group && t.group.length > 0);
  if (!alreadyGrouped) {
    console.log("AssignGroupID...");
    algosdk.assignGroupID(txns);
  }
  const stxns = txns.map((t) => t.signTxn(signer.sk)); // локальная подпись

  const { txid } = await algod.sendRawTransaction(stxns).do();

  // await algosdk.waitForConfirmation(algod, txid, 1);
  return txid;
}

// async function populateAndSend(atc: AtomicTransactionComposer, algod: Algodv2): Promise<string> {
//   console.log("@ before POP");
//   const populatedAtc = await populateAppCallResources(atc, algod);
//   console.log("@ before submit");
//   const submit = await populatedAtc.submit(algod);
//   // console.log('submit', submit)
//   return submit[0];
// }

// async function customPackAndSend(atc: AtomicTransactionComposer, algod: Algodv2): Promise<string> {
//   console.log("@ before packResources");
//   const packedAtc = await packResources(algod, atc);
//   console.log("@ before submit");
//   const submit = await packedAtc.submit(algod);
//   return submit[0];
// }
