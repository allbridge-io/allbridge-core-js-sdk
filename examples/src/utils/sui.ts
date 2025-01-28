import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { getEnvVar } from "./env";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

export async function sendSuiRawTransaction(xdr: string): Promise<SuiTransactionBlockResponse> {
  const tx = Transaction.from(xdr);

  const client = new SuiClient({
    url: getEnvVar("SUI_PROVIDER_URL"),
  });
  const signer = Ed25519Keypair.fromSecretKey(getEnvVar("SUI_PRIVATE_KEY"));
  const txBlockResponse = await client.signAndExecuteTransaction({
    signer: signer,
    transaction: tx,
  });

  return await client.waitForTransaction({
    digest: txBlockResponse.digest,
    pollInterval: 100,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });
}
