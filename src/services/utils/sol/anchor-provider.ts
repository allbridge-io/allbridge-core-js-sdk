import { AnchorProvider, Provider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

export function buildAnchorProvider(solanaRpcUrl: string, accountAddress: string): Provider {
  const connection = new Connection(solanaRpcUrl, "confirmed");

  const publicKey = new PublicKey(accountAddress);

  return new AnchorProvider(
    connection,
    // @ts-expect-error enough wallet for fetch actions
    { publicKey: publicKey },
    {
      preflightCommitment: "confirmed",
      commitment: "confirmed",
    }
  );
}
