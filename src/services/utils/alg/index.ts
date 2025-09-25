import { AlgorandClient, populateAppCallResources } from "@algorandfoundation/algokit-utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { TransactionComposer } from "@algorandfoundation/algokit-utils/types/composer";
import algosdk, {
  ABIMethod,
  Address,
  Algodv2,
  AtomicTransactionComposer,
  makeBasicAccountTransactionSigner,
  Transaction,
} from "algosdk";
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

export async function populateAndEncodeTxs(
  txs: Transaction[],
  sender: Address,
  algod: Algodv2
): Promise<RawAlgTransaction> {
  const atc = new AtomicTransactionComposer();
  const txnSigner = makeBasicAccountTransactionSigner({ addr: sender, sk: new Uint8Array(64) });
  txs.forEach((txn) => {
    atc.addTransaction({ txn, signer: txnSigner });
  });
  const populatedAtc = await populateAppCallResources(atc, algod);
  const populatedTxs = populatedAtc.buildGroup().map((tx) => tx.txn);
  return encodeTxs(...populatedTxs);
}

export function encodeTxs(...txs: Transaction[]): RawAlgTransaction {
  const blobs = txs.map((tx) => algosdk.encodeUnsignedTransaction(tx));
  return blobs.map((b) => Buffer.from(b).toString("hex"));
}

export async function checkAppOptIn(
  appId: string | bigint,
  sender: string,
  algorand: AlgorandClient
): Promise<boolean> {
  if (typeof appId === "string") {
    appId = BigInt(appId);
  }
  const info = await algorand.account.getInformation(sender);
  const localStates = info.appsLocalState;
  if (localStates) {
    const isOptedIn = localStates.find(({ id }) => id === appId);
    return isOptedIn !== undefined;
  }
  return false;
}
