import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { ChainSymbol } from "../../../chains/chain.enums";
import { SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { NodeRpcUrlsConfig } from "../../../services";
import { TokenCoreFields } from "../../../tokens-info";
import { DefaultSolUtils } from "../../../utils/sol";

const MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // cSpell:disable-line

describe("DefaultSolUtils.hasTokenAccount", () => {
  const owner = Keypair.generate().publicKey;
  let utils: DefaultSolUtils;
  let connection: { getAccountInfo: jest.Mock };

  beforeEach(() => {
    utils = new DefaultSolUtils({} as NodeRpcUrlsConfig, {} as AllbridgeCoreSdkOptions);
    connection = { getAccountInfo: jest.fn() };
    (utils as unknown as { connection: () => typeof connection }).connection = () => connection;
  });

  function tokenOf(overrides: Partial<TokenCoreFields> = {}): TokenCoreFields {
    return { chainSymbol: ChainSymbol.SOL, decimals: 6, tokenAddress: MINT.toBase58(), ...overrides };
  }

  function mockAccounts(tokenProgramId: PublicKey, tokenAccount: object | null) {
    connection.getAccountInfo.mockImplementation((address: PublicKey) =>
      Promise.resolve(address.equals(MINT) ? { owner: tokenProgramId } : tokenAccount)
    );
  }

  test("☀ is true when the associated token account exists", async () => {
    mockAccounts(TOKEN_PROGRAM_ID, { owner: TOKEN_PROGRAM_ID });

    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf())).resolves.toBe(true);
    const tokenAccount = getAssociatedTokenAddressSync(MINT, owner, true, TOKEN_PROGRAM_ID);
    expect(connection.getAccountInfo).toHaveBeenCalledWith(tokenAccount);
  });

  test("☀ is false when the associated token account is missing", async () => {
    mockAccounts(TOKEN_PROGRAM_ID, null);

    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf())).resolves.toBe(false);
  });

  test("☀ derives the account with the Token-2022 program of the mint", async () => {
    mockAccounts(TOKEN_2022_PROGRAM_ID, { owner: TOKEN_2022_PROGRAM_ID });

    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf())).resolves.toBe(true);
    const tokenAccount = getAssociatedTokenAddressSync(MINT, owner, true, TOKEN_2022_PROGRAM_ID);
    expect(connection.getAccountInfo).toHaveBeenCalledWith(tokenAccount);
  });

  test("☀ is true for the native token without a request", async () => {
    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf({ isNative: true }))).resolves.toBe(true);
    expect(connection.getAccountInfo).not.toHaveBeenCalled();
  });

  test("☁ rejects a token on another chain", async () => {
    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf({ chainSymbol: ChainSymbol.ETH }))).rejects.toThrow(
      SdkError
    );
  });

  test("☁ rejects a mint that is not owned by a token program", async () => {
    mockAccounts(Keypair.generate().publicKey, null);

    await expect(utils.hasTokenAccount(owner.toBase58(), tokenOf())).rejects.toThrow(SdkError);
  });
});
