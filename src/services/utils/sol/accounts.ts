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

export async function getCctpAuthorityAccount(
  cctpBridgeAccount: PublicKey,
  cctpBridgeProgramId: PublicKey
): Promise<PublicKey> {
  const [poolAuthority] = await PublicKey.findProgramAddress([cctpBridgeAccount.toBuffer()], cctpBridgeProgramId);
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

export async function getCctpBridgeAccount(mintAccount: PublicKey, cctpBridgeProgramId: PublicKey): Promise<PublicKey> {
  const [configPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("cctp_bridge"), mintAccount.toBytes()],
    cctpBridgeProgramId
  );
  return configPda;
}

export async function getCctpBridgeTokenAccount(token: PublicKey, cctpBridgeProgramId: PublicKey): Promise<PublicKey> {
  const [poolPda] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("token"), token.toBytes()],
    cctpBridgeProgramId
  );
  return poolPda;
}

export function getCctpLockAccount(cctpBridgeProgramId: PublicKey, messageSentEventDataAccount: PublicKey): PublicKey {
  const [tokenMessengerEventAuthority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("lock"), messageSentEventDataAccount.toBuffer()],
    cctpBridgeProgramId
  );
  return tokenMessengerEventAuthority;
}

export function getCctpAccounts(
  domain: number,
  mintAccount: PublicKey,
  cctpTransmitterProgramId: PublicKey,
  cctpTokenMessengerMinter: PublicKey
) {
  const messageTransmitterAccount = findProgramAddress("message_transmitter", cctpTransmitterProgramId);
  const tokenMessenger = findProgramAddress("token_messenger", cctpTokenMessengerMinter);
  const tokenMessengerEventAuthority = findProgramAddress("__event_authority", cctpTokenMessengerMinter);
  const tokenMinter = findProgramAddress("token_minter", cctpTokenMessengerMinter);
  const localToken = findProgramAddress("local_token", cctpTokenMessengerMinter, [mintAccount]);
  const remoteTokenMessengerKey = findProgramAddress("remote_token_messenger", cctpTokenMessengerMinter, [
    domain.toString(),
  ]);
  const authorityPda = findProgramAddress("sender_authority", cctpTokenMessengerMinter);
  return {
    messageTransmitterAccount,
    tokenMessenger,
    tokenMessengerEventAuthority,
    tokenMinter,
    localToken,
    remoteTokenMessengerKey,
    authorityPda,
  };
}

function findProgramAddress(
  label: string,
  programId: PublicKey,
  extraSeeds: (string | number[] | Buffer | PublicKey)[] = []
): PublicKey {
  const seeds = [Buffer.from(anchor.utils.bytes.utf8.encode(label))];
  for (const extraSeed of extraSeeds) {
    if (typeof extraSeed === "string") {
      seeds.push(Buffer.from(anchor.utils.bytes.utf8.encode(extraSeed)));
    } else if (Array.isArray(extraSeed)) {
      seeds.push(Buffer.from(extraSeed));
    } else if (Buffer.isBuffer(extraSeed)) {
      seeds.push(extraSeed);
    } else {
      seeds.push(extraSeed.toBuffer());
    }
  }
  const res = PublicKey.findProgramAddressSync(seeds, programId);
  return res[0];
}
