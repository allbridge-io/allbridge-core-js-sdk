import { TronWeb } from "tronweb";
import { SignedTransaction } from "tronweb/src/types/Transaction";
import { InvalidTxError, VerifyTxError } from "../../../exceptions";
import { RawTransaction } from "../../models";
import { sleep } from "../index";

export async function sendRawTransaction(tronWeb: TronWeb, rawTransaction: RawTransaction): Promise<{ txId: string }> {
  const signedTx = await tronWeb.trx.sign(rawTransaction as any);

  if (!(signedTx as SignedTransaction).signature) {
    throw new InvalidTxError("Transaction was not signed properly");
  }

  const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
  const transactionHash = receipt.transaction.txID;
  await verifyTx(tronWeb, transactionHash);
  return { txId: transactionHash };
}

export async function verifyTx(tronWeb: TronWeb, txId: string, timeout = 10000): Promise<any> {
  const start = Date.now();

  while (true) {
    if (Date.now() - start > timeout) {
      throw new VerifyTxError("Transaction not found");
    }
    const result = await tronWeb.trx.getUnconfirmedTransactionInfo(txId);
    if (!result?.receipt) {
      await sleep(2000);
      continue;
    }
    if (result.receipt.result === "SUCCESS") {
      return result;
    } else {
      throw new VerifyTxError(`Transaction status is ${result.receipt.result}`);
    }
  }
}
