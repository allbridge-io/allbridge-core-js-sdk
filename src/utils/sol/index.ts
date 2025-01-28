import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { ChainSymbol } from "../../chains/chain.enums";
import { AllbridgeCoreSdkOptions, SdkError } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { fetchAddressLookupTableAccountsFromTx } from "./utils";

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
}

export class DefaultSolUtils implements SolUtils {
  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  async addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void> {
    if (memo.length > 28) {
      throw new SdkError("InvalidArgumentException memo cannot be more than 28 characters");
    }
    const connection = new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
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
}
