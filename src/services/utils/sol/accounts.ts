import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export async function getAssociatedAccount(publicKey: PublicKey, mintAccount: PublicKey): Promise<PublicKey> {
  return anchor.utils.token.associatedAddress({
    mint: mintAccount,
    owner: publicKey,
  });
}

export async function getConfigAccount(programId: PublicKey): Promise<PublicKey> {
  const [configPda] = await PublicKey.findProgramAddress([anchor.utils.bytes.utf8.encode("config")], programId);
  return configPda;
}

export async function getLockAccount(nonce: number[], bridgeProgramId: PublicKey): Promise<PublicKey> {
  const [lockPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("lock"), Uint8Array.from(nonce)],
    bridgeProgramId
  );
  return lockPda;
}

export async function getPriceAccount(chainId: number, gasOracleProgramId: PublicKey): Promise<PublicKey> {
  const [pricePda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("price_v2"), Uint8Array.from([chainId])],
    gasOracleProgramId
  );
  return pricePda;
}

export async function getAuthorityAccount(bridgeProgramId: PublicKey): Promise<PublicKey> {
  const configAccount = await getConfigAccount(bridgeProgramId);
  const [poolAuthority] = await PublicKey.findProgramAddress([configAccount.toBuffer()], bridgeProgramId);
  return poolAuthority;
}

export async function getBridgeTokenAccount(mintAccount: PublicKey, bridgeProgramId: PublicKey): Promise<PublicKey> {
  const [poolPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("token"), mintAccount.toBytes()],
    bridgeProgramId
  );
  return poolPda;
}

export async function getOtherChainTokenAccount(
  chainId: number,
  token: Buffer,
  bridgeProgramId: PublicKey
): Promise<PublicKey> {
  const [otherChainTokenPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("other_bridge_token"), Buffer.from([chainId]), token],
    bridgeProgramId
  );
  return otherChainTokenPda;
}

export async function getChainBridgeAccount(chainId: number, bridgeProgramId: PublicKey): Promise<PublicKey> {
  const [chainBridgePda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("chain_bridge"), Uint8Array.from([chainId])],
    bridgeProgramId
  );
  return chainBridgePda;
}

export async function getGasUsageAccount(chainId: number, messengerProgramId: PublicKey): Promise<PublicKey> {
  const [chainBridgePda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("gas_usage"), Uint8Array.from([chainId])],
    messengerProgramId
  );
  return chainBridgePda;
}

export async function getSendMessageAccount(
  messageWithSigner: Uint8Array,
  messengerProgramId: PublicKey
): Promise<PublicKey> {
  const [sentMessagePda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("sent_message"), messageWithSigner],
    messengerProgramId
  );
  return sentMessagePda;
}

export async function getUserDepositAccount(
  userPublicKey: PublicKey,
  tokenMintAccount: PublicKey,
  bridgeProgramId: PublicKey
): Promise<PublicKey> {
  const [userDepositPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("user_deposit"), tokenMintAccount.toBytes(), userPublicKey.toBytes()],
    bridgeProgramId
  );
  return userDepositPda;
}
