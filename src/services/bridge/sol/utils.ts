import { web3 } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionMessage,
  TransactionMessageArgs,
  VersionedTransaction,
} from "@solana/web3.js";
import { JupiterError, SdkError } from "../../../exceptions";
import { fetchAddressLookupTableAccountsFromTx } from "../../../utils/sol/utils";
import { TxSendParamsSol } from "../models";

export interface SolTxSendParams extends TxSendParamsSol {
  poolAddress: string;
}

export async function amendJupiterWithSdkTx(
  connection: Connection,
  jupTx: VersionedTransaction,
  sdkTx: VersionedTransaction
): Promise<VersionedTransaction> {
  try {
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(jupTx, connection);
    const sdkAddressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(sdkTx, connection);

    const message = TransactionMessage.decompile(jupTx.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });
    const sdkMessage = TransactionMessage.decompile(sdkTx.message, {
      addressLookupTableAccounts: sdkAddressLookupTableAccounts,
    });
    sdkMessage.instructions.shift();
    message.instructions.push(...sdkMessage.instructions);

    addressLookupTableAccounts.push(...sdkAddressLookupTableAccounts);

    jupTx.message = message.compileToV0Message(addressLookupTableAccounts);

    if (sdkTx.message.header.numRequiredSignatures === 2 && jupTx.signatures.length === 1) {
      const signature = sdkTx.signatures[0];
      if (!signature) {
        throw new SdkError("Signature is undefined");
      }
      jupTx.signatures.push(signature);
    }
    return jupTx;
  } catch (e) {
    if (e instanceof Error && e.message) {
      throw new JupiterError(`Some error occurred during creation final swap and bridge transaction. ${e.message}`);
    }
    throw new JupiterError("Some error occurred during creation final swap and bridge transaction");
  }
}

export async function convertToVersionedTransaction(
  tx: Transaction,
  connection: Connection,
  solanaLookUpTable: string
): Promise<VersionedTransaction> {
  const allbridgeTableAccount = await connection
    .getAddressLookupTable(new PublicKey(solanaLookUpTable))
    .then((res) => res.value);
  if (!allbridgeTableAccount) {
    throw new SdkError("Cannot find allbridgeLookupTableAccount");
  }
  const messageV0 = new web3.TransactionMessage({
    payerKey: tx.feePayer,
    recentBlockhash: tx.recentBlockhash,
    instructions: tx.instructions,
  } as TransactionMessageArgs).compileToV0Message([allbridgeTableAccount]);
  return new web3.VersionedTransaction(messageV0);
}
