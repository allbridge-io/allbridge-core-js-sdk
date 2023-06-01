import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, RawTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import solanaWeb3, { sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("SOL_ACCOUNT_ADDRESS");
  const privateKey = getEnvVar("SOL_PRIVATE_KEY");
  const tokenAddress = getEnvVar("SOL_TOKEN_ADDRESS");

  const sdk = new AllbridgeCoreSdk();
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  // create claim rewards raw transaction
  const transaction = await sdk.pool.rawTxBuilder.claimRewards({
    accountAddress: accountAddress,
    token: tokenInfo,
  });

  const tx = await sendRawTransaction(transaction, privateKey, sdk.params.solanaRpcUrl);

  console.log("Token claim rewards:", tx);
};

async function sendRawTransaction(transaction: RawTransaction, privateKey: string, solanaRpcUrl: string) {
  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));
  const connection = new solanaWeb3.Connection(solanaRpcUrl, "confirmed");
  return await sendAndConfirmTransaction(connection, transaction as Transaction, [keypair]);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
