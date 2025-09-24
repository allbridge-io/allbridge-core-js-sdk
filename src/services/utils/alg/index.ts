import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { TransactionComposer } from "@algorandfoundation/algokit-utils/types/composer";
import algosdk, { ABIMethod, Address, Transaction } from "algosdk";
import { RawAlgTransaction } from "../../models";

export const mNoop = new ABIMethod({
  name: "noop",
  args: [],
  returns: { type: "void" },
});

export function addBudgetNoops(opts: {
  composer: TransactionComposer;
  appId: bigint;
  sender: string | Address;
  signer?: any;
  count: number;
}) {
  const { composer, appId, sender, signer, count } = opts;
  for (let i = 0; i < count; i++) {
    composer.addAppCallMethodCall({
      appId,
      method: mNoop,
      args: [],
      sender,
      signer,
      note: `noop_${i}`,
    });
  }
}

export function feeForInner(innerCount: number): AlgoAmount {
  return (innerCount * 1000).microAlgos(); // 1000 μAlgos per tx
}

export function encodeTxs(...tx: Transaction[]): RawAlgTransaction {
  const blobs = tx.map((txn) => algosdk.encodeUnsignedTransaction(txn));
  return blobs.map((b) => Buffer.from(b).toString("hex"));
}
