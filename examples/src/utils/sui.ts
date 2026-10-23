import { SuiClientTypes } from "@mysten/sui/client";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getEnvVar } from "./env";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

export async function sendSuiRawTransaction(
  xdr: string
): Promise<SuiClientTypes.TransactionResult<{ effects: true; events: true }>> {
  const tx = Transaction.from(xdr);

  // Sui full nodes serve gRPC-web (sui.rpc.v2) instead of JSON-RPC; SUI_PROVIDER_URL is the full node base URL
  const client = new SuiGrpcClient({
    network: "mainnet",
    baseUrl: getEnvVar("SUI_PROVIDER_URL"),
  });
  const signer = Ed25519Keypair.fromSecretKey(getEnvVar("SUI_PRIVATE_KEY"));
  return await client.signAndExecuteTransaction({
    signer: signer,
    transaction: tx,
    include: { effects: true, events: true },
  });
}
