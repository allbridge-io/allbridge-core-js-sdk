import {
  broadcastTransaction,
  BytesReader,
  createSingleSigSpendingCondition,
  deserializeTransaction,
  fetchNonce,
  privateKeyToPublic,
  TransactionSigner,
} from "@stacks/transactions";
import { getEnvVar } from "./env";
import { getAddressFromPublicKey } from "@stacks/transactions/src/keys";
import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { StacksNetwork } from "@stacks/network/src/network";
import axios from "axios";
import { SingleSigHashMode } from "@stacks/transactions/src/constants";

export async function sendStxRawTransaction(serializedTx: string): Promise<string> {
  const network = getStxNetwork(getEnvVar("STX_PROVIDER_URL"));
  const secretKey = getEnvVar("STX_PRIVATE_KEY");

  const reader = new BytesReader(Buffer.from(serializedTx, "hex"));
  const tx = deserializeTransaction(reader);

  const realPublicKey = privateKeyToPublic(secretKey);
  const address = getAddressFromPublicKey(realPublicKey, network);

  const origin = tx.auth.spendingCondition;

  const realNonce = await fetchNonce({ address, network });
  tx.auth.spendingCondition = createSingleSigSpendingCondition(
    origin.hashMode as SingleSigHashMode,
    realPublicKey,
    realNonce,
    origin.fee
  );

  const signer = new TransactionSigner(tx);
  signer.signOrigin(secretKey);

  const res = await broadcastTransaction({ transaction: tx, network });
  console.log(`Stacks sent tx: ${res.txid}`);
  if ((res as any).error) {
    const err = res as { error: string; reason?: string };
    throw new Error(`Broadcast failed: ${err.error}${err.reason ? ` (reason: ${err.reason})` : ""}`);
  }

  await waitStacksTx(network.client.baseUrl, res.txid);
  console.log(`Stacks tx ${res.txid} sent successfully`);

  return res.txid;
}

export function getStxNetwork(nodeUrl: string): StacksNetwork {
  const isTestnet = nodeUrl.includes("testnet");

  return isTestnet
    ? { ...STACKS_TESTNET, client: { baseUrl: nodeUrl } }
    : { ...STACKS_MAINNET, client: { baseUrl: nodeUrl } };
}

async function waitStacksTx(nodeUrl: string, txId: string, timeout: number = 20000): Promise<string> {
  console.log("Confirming tx...");
  const startTime = Date.now();
  let lastErrorMessage = "";
  let lastStatus = "";
  while (Date.now() - startTime < timeout) {
    let result;
    try {
      result = await axios({
        url: `/extended/v1/tx/${txId}`,
        method: "get",
        baseURL: nodeUrl,
      });
    } catch (e: any) {
      lastErrorMessage = e.message;
    }
    if (result) {
      lastStatus = result.data?.tx_status;
      if (lastStatus === "success") {
        return result.data?.tx_result?.repr;
      } else if (result.data?.tx_status && result.data?.tx_status !== "pending") {
        throw new Error(`${result.data?.tx_status}: ${result.data?.tx_result?.repr}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const errorMessage = `Tx ${txId} timeout. ${lastStatus ? `Status: ${lastStatus}` : `Error: ${lastErrorMessage}`}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// export function deriveFromMnemonic(mnemonic: string, index = 0, network: "mainnet" | "testnet" = "testnet") {
//   // 1) root node from mnemonic
//   const seed = mnemonicToSeedSync(mnemonic);
//   const root = HDKey.fromMasterSeed(seed);
//
//   // 2) derive STX private key for index (m/44'/5757'/0'/0/index)
//   const privateKeyHex = deriveStxPrivateKey({ rootNode: root, index });
//
//   // 3) public key and address
//   const publicKeyHex = publicKeyToHex(privateKeyToPublic(privateKeyHex));
//   const address = getAddressFromPrivateKey(privateKeyHex, network);
//
//   return {
//     path: `m/44'/5757'/0'/0/${index}`,
//     privateKeyHex,
//     publicKeyHex,
//     address,
//   };
// }
