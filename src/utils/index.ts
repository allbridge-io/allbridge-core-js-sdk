import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { SdkError } from "../exceptions";
import { fetchAddressLookupTableAccountsFromTx } from "./sol";

/**
 * Contains usefully methods
 */
export interface Utils {
  /**
   * Add memo to solana's transaction
   * @param transaction transaction to add memo
   * @param memo memo to add (28 char max)
   */
  addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void>;
}

export class DefaultUtils implements Utils {
  constructor(readonly solanaRpcUrl: string) {}

  async addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void> {
    if (memo.length > 28) {
      throw new SdkError("InvalidArgumentException memo cannot be more than 28 characters");
    }
    const connection = new Connection(this.solanaRpcUrl, "confirmed");
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });
    message.instructions[message.instructions.length - 1].keys.push({
      pubkey: new PublicKey(Buffer.from(memo)),
      isSigner: false,
      isWritable: false,
    });
    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
  }
}
