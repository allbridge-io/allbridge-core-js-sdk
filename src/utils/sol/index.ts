import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { ChainSymbol } from "../../chains/chain.enums";
import { AllbridgeCoreSdkOptions, SdkError } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { TokenCoreFields } from "../../tokens-info";
import { fetchAddressLookupTableAccountsFromTx, getTokenProgramId } from "./utils";

/**
 * Contains usefully Solana methods
 */
export interface SolUtils {
  /**
   * Add memo to solana's transaction
   * @param transaction transaction to add memo
   * @param memo memo to add (28 char max)
   */
  addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void>;

  /**
   * Whether the account has the associated token account of the token, the account the token is received on.
   * A native token (SOL) needs none, so it is always `true`.
   *
   * Check it before a transfer to Solana that does not create the account itself, like `Messenger.LIFI_INTENTS`:
   * a solver does not fill an order to an account without it, and the order is refunded.
   * @param accountAddress the owner account address
   * @param token the token on Solana
   * @throws SdkError if the token is not on Solana or its mint is not owned by a token program
   */
  hasTokenAccount(accountAddress: string, token: TokenCoreFields): Promise<boolean>;
}

export class DefaultSolUtils implements SolUtils {
  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  async hasTokenAccount(accountAddress: string, token: TokenCoreFields): Promise<boolean> {
    if (token.chainSymbol !== ChainSymbol.SOL) {
      throw new SdkError(`hasTokenAccount expects a Solana token, got ${token.chainSymbol}`);
    }
    if (token.isNative) {
      return true;
    }
    const connection = this.connection();
    const mint = new PublicKey(token.tokenAddress);
    const tokenProgramId = await getTokenProgramId(connection, mint);
    const tokenAccount = getAssociatedTokenAddressSync(mint, new PublicKey(accountAddress), true, tokenProgramId);
    return (await connection.getAccountInfo(tokenAccount)) !== null;
  }

  async addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void> {
    if (memo.length > 28) {
      throw new SdkError("InvalidArgumentException memo cannot be more than 28 characters");
    }
    const connection = this.connection();
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });
    const lastInstruction = message.instructions[message.instructions.length - 1];
    if (!lastInstruction?.keys) {
      throw new SdkError("Last instruction or its keys are invalid.");
    }

    lastInstruction.keys.push({
      pubkey: new PublicKey(Buffer.from(memo)),
      isSigner: false,
      isWritable: false,
    });
    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
  }

  private connection(): Connection {
    return new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
  }
}
