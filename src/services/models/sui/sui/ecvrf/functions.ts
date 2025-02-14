// @ts-nocheck
import { PUBLISHED_AT } from "..";
import { pure } from "../../_framework/util";
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";

export interface EcvrfVerifyArgs {
  hash: Array<number | TransactionArgument> | TransactionArgument;
  alphaString: Array<number | TransactionArgument> | TransactionArgument;
  publicKey: Array<number | TransactionArgument> | TransactionArgument;
  proof: Array<number | TransactionArgument> | TransactionArgument;
}

export function ecvrfVerify(tx: Transaction, args: EcvrfVerifyArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::ecvrf::ecvrf_verify`,
    arguments: [
      pure(tx, args.hash, `vector<u8>`),
      pure(tx, args.alphaString, `vector<u8>`),
      pure(tx, args.publicKey, `vector<u8>`),
      pure(tx, args.proof, `vector<u8>`),
    ],
  });
}
