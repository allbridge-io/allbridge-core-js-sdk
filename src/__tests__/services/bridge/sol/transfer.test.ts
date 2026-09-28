import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  decodeTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { ChainSymbol } from "../../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../../client/core-api/core-client-base";
import { SdkError } from "../../../../exceptions";
import { SolanaBridgeParams, SolanaBridgeService } from "../../../../services/bridge/sol";
import { TokenWithChainDetails } from "../../../../tokens-info";

const BLOCKHASH = new PublicKey("SysvarC1ock11111111111111111111111111111111").toBase58();
const MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // cSpell:disable-line

describe("SolanaBridgeService.buildRawTransactionTransfer", () => {
  const sender = Keypair.generate().publicKey;
  const depositAddress = Keypair.generate().publicKey;
  let service: SolanaBridgeService;
  let connection: { getLatestBlockhash: jest.Mock; getAccountInfo: jest.Mock };

  beforeEach(() => {
    service = new SolanaBridgeService(
      "https://solana.example",
      {
        solanaLookUpTable: PublicKey.default.toBase58(),
        jupiterParams: { jupiterUrl: "https://jupiter.example" },
      } as unknown as SolanaBridgeParams,
      {} as AllbridgeCoreClient
    );
    connection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: BLOCKHASH, lastValidBlockHeight: 1 }),
      getAccountInfo: jest.fn().mockResolvedValue({ owner: TOKEN_PROGRAM_ID }),
    };
    (service as unknown as { connection: typeof connection }).connection = connection;
  });

  function decompile(tx: VersionedTransaction) {
    return TransactionMessage.decompile(tx.message);
  }

  function tokenOf(overrides: Partial<TokenWithChainDetails> = {}): TokenWithChainDetails {
    return {
      chainSymbol: ChainSymbol.SOL,
      decimals: 6,
      tokenAddress: MINT.toBase58(),
      ...overrides,
    } as TokenWithChainDetails;
  }

  test("☀ creates the recipient ATA if missing and transfers the tokens to it", async () => {
    const tx = (await service.buildRawTransactionTransfer({
      amount: "1330000",
      token: tokenOf(),
      fromAccountAddress: sender.toBase58(),
      toAddress: depositAddress.toBase58(),
    })) as VersionedTransaction;

    expect(tx).toBeInstanceOf(VersionedTransaction);
    expect(connection.getAccountInfo).toHaveBeenCalledWith(MINT);
    const message = decompile(tx);
    expect(message.payerKey.equals(sender)).toBe(true);
    expect(message.recentBlockhash).toEqual(BLOCKHASH);
    expect(message.instructions).toHaveLength(2);

    const senderAta = getAssociatedTokenAddressSync(MINT, sender);
    const recipientAta = getAssociatedTokenAddressSync(MINT, depositAddress);
    const [createAta, transfer] = message.instructions;

    expect(createAta?.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true);
    expect(Array.from(createAta?.data ?? [])).toEqual([1]); // CreateIdempotent
    const createAtaKeys = createAta?.keys.map((key) => key.pubkey.toBase58());
    expect(createAtaKeys?.slice(0, 4)).toEqual([
      sender.toBase58(),
      recipientAta.toBase58(),
      depositAddress.toBase58(),
      MINT.toBase58(),
    ]);
    expect(createAtaKeys?.[5]).toEqual(TOKEN_PROGRAM_ID.toBase58());

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decoded = decodeTransferCheckedInstruction(transfer!, TOKEN_PROGRAM_ID);
    expect(decoded.keys.source.pubkey.equals(senderAta)).toBe(true);
    expect(decoded.keys.mint.pubkey.equals(MINT)).toBe(true);
    expect(decoded.keys.destination.pubkey.equals(recipientAta)).toBe(true);
    expect(decoded.keys.owner.pubkey.equals(sender)).toBe(true);
    expect(decoded.data.amount).toEqual(1330000n);
    expect(decoded.data.decimals).toEqual(6);
  });

  test("☀ uses the Token-2022 program for a Token-2022 mint", async () => {
    connection.getAccountInfo.mockResolvedValue({ owner: TOKEN_2022_PROGRAM_ID });

    const tx = (await service.buildRawTransactionTransfer({
      amount: "5",
      token: tokenOf(),
      fromAccountAddress: sender.toBase58(),
      toAddress: depositAddress.toBase58(),
    })) as VersionedTransaction;

    const [createAta, transfer] = decompile(tx).instructions;
    const recipientAta = getAssociatedTokenAddressSync(MINT, depositAddress, true, TOKEN_2022_PROGRAM_ID);
    expect(createAta?.keys[1]?.pubkey.equals(recipientAta)).toBe(true);
    expect(createAta?.keys[5]?.pubkey.equals(TOKEN_2022_PROGRAM_ID)).toBe(true);
    expect(transfer?.programId.equals(TOKEN_2022_PROGRAM_ID)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decoded = decodeTransferCheckedInstruction(transfer!, TOKEN_2022_PROGRAM_ID);
    expect(decoded.keys.destination.pubkey.equals(recipientAta)).toBe(true);
    expect(decoded.data.amount).toEqual(5n);
  });

  test("☀ builds a SystemProgram transfer of lamports for a native token", async () => {
    const tx = (await service.buildRawTransactionTransfer({
      amount: "1500000000",
      token: tokenOf({ decimals: 9, tokenAddress: "So11111111111111111111111111111111111111112", isNative: true }),
      fromAccountAddress: sender.toBase58(),
      toAddress: depositAddress.toBase58(),
    })) as VersionedTransaction;

    expect(connection.getAccountInfo).not.toHaveBeenCalled();
    const message = decompile(tx);
    expect(message.instructions).toHaveLength(1);
    const [transfer] = message.instructions;
    expect(transfer?.programId.equals(SystemProgram.programId)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decoded = SystemInstruction.decodeTransfer(transfer!);
    expect(decoded.fromPubkey.equals(sender)).toBe(true);
    expect(decoded.toPubkey.equals(depositAddress)).toBe(true);
    expect(decoded.lamports).toEqual(1500000000n);
  });

  test("☁ rejects a mint that does not exist", async () => {
    connection.getAccountInfo.mockResolvedValue(null);

    await expect(
      service.buildRawTransactionTransfer({
        amount: "5",
        token: tokenOf(),
        fromAccountAddress: sender.toBase58(),
        toAddress: depositAddress.toBase58(),
      })
    ).rejects.toThrow(SdkError);
  });

  test("☁ rejects a mint not owned by a token program", async () => {
    connection.getAccountInfo.mockResolvedValue({ owner: SystemProgram.programId });

    await expect(
      service.buildRawTransactionTransfer({
        amount: "5",
        token: tokenOf(),
        fromAccountAddress: sender.toBase58(),
        toAddress: depositAddress.toBase58(),
      })
    ).rejects.toThrow("is not owned by a token program");
  });
});
