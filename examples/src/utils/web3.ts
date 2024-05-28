import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { getEnvVar } from "./env";

export async function sendEvmRawTransaction(rawTransaction: TransactionConfig) {
  // configure web3
  const web3 = new Web3(getEnvVar("WEB3_PROVIDER_URL"));
  const account = web3.eth.accounts.privateKeyToAccount(getEnvVar("ETH_PRIVATE_KEY"));
  web3.eth.accounts.wallet.add(account);

  if (rawTransaction.from === undefined) {
    throw Error("rawTransaction.from is undefined");
  }
  const gasLimit = await web3.eth.estimateGas(rawTransaction);

  const signedTx = await account.signTransaction({
    ...rawTransaction,
    gas: gasLimit,
  });
  if (signedTx.rawTransaction === undefined) {
    throw Error("signedTx.rawTransaction is undefined");
  }
  console.log("Sending transaction", signedTx.transactionHash);
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
