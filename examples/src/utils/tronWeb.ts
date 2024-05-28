import { RawTronTransaction } from "@allbridge/bridge-core-sdk";
import { getEnvVar } from "./env";
// @ts-expect-error import tron
import TronWeb from "tronweb";

export async function sendTrxRawTransaction(rawTransaction: RawTronTransaction) {
  // configure TronWeb
  const tronWeb = new TronWeb(
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRONWEB_PROVIDER_URL"),
    getEnvVar("TRX_PRIVATE_KEY")
  );

  const signedTx = await tronWeb.trx.sign(rawTransaction);
  if (!signedTx.signature) {
    throw Error("Transaction was not signed properly");
  }
  // Broadcasting the transaction
  return tronWeb.trx.sendRawTransaction(signedTx);
}
