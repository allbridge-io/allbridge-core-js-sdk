import * as SorobanClient from "soroban-client";
import { Address, SorobanRpc } from "soroban-client";
import type { Memo, MemoType, Operation, Transaction, xdr } from "soroban-client";
import type { ClassOptions, MethodOptions, ResponseTypes, Wallet } from "./method-options.js";

export type Tx = Transaction<Memo<MemoType>, Operation[]>;

type SendTx = SorobanRpc.SendTransactionResponse;
type GetTx = SorobanRpc.GetTransactionResponse;

type InvokeArgs = ClassOptions & {
  sender: Address;
  method: string;
  args?: any[];
};

/**
 * Invoke a method on the test_custom_types contract.
 *
 * Uses Freighter to determine the current user and if necessary sign the transaction.
 *
 * @returns {T}, by default, the parsed XDR from either the simulation or the full transaction. If `simulateOnly` or `fullRpcResponse` are true, returns either the full simulation or the result of sending/getting the transaction to/from the ledger.
 */
export async function xdrTxBuilder(args: InvokeArgs): Promise<string>;
export async function xdrTxBuilder({
  sender,
  method,
  args = [],
  rpcUrl,
  networkPassphrase,
  contractId,
  wallet,
}: InvokeArgs): Promise<string> {
  const fee = 100;

  const server = new SorobanClient.Server(rpcUrl);
  const account = await server.getAccount(sender.toString());
  const contract = new SorobanClient.Contract(contractId);

  return new SorobanClient.TransactionBuilder(account, {
    fee: fee.toString(10),
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build()
    .toXDR();
}

/**
 * Sign a transaction with Freighter and return the fully-reconstructed
 * transaction ready to send with {@link sendTx}.
 *
 * If you need to construct a transaction yourself rather than using `invoke`
 * or one of the exported contract methods, you may want to use this function
 * to sign the transaction with Freighter.
 */
export async function signTx(wallet: Wallet, tx: Tx, networkPassphrase: string): Promise<Tx> {
  const signed = await wallet.signTransaction(tx.toXDR(), {
    networkPassphrase,
  });

  return SorobanClient.TransactionBuilder.fromXDR(signed, networkPassphrase) as Tx;
}

/**
 * Send a transaction to the Soroban network.
 *
 * Wait `secondsToWait` seconds for the transaction to complete (default: 10).
 *
 * If you need to construct or sign a transaction yourself rather than using
 * `invoke` or one of the exported contract methods, you may want to use this
 * function for its timeout/`secondsToWait` logic, rather than implementing
 * your own.
 */
export async function sendTx(tx: Tx, secondsToWait: number, server: SorobanClient.Server): Promise<SendTx | GetTx> {
  const sendTransactionResponse = await server.sendTransaction(tx);

  if (sendTransactionResponse.status !== "PENDING" || secondsToWait === 0) {
    return sendTransactionResponse;
  }

  let getTransactionResponse = await server.getTransaction(sendTransactionResponse.hash);

  const waitUntil = new Date(Date.now() + secondsToWait * 1000).valueOf();

  let waitTime = 1000;
  let exponentialFactor = 1.5;

  while (Date.now() < waitUntil && getTransactionResponse.status === SorobanRpc.GetTransactionStatus.NOT_FOUND) {
    // Wait a beat
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    /// Exponential backoff
    waitTime = waitTime * exponentialFactor;
    // See if the transaction is complete
    getTransactionResponse = await server.getTransaction(sendTransactionResponse.hash);
  }

  if (getTransactionResponse.status === SorobanRpc.GetTransactionStatus.NOT_FOUND) {
    console.error(
      `Waited ${secondsToWait} seconds for transaction to complete, but it did not. ` +
        `Returning anyway. Check the transaction status manually. ` +
        `Info: ${JSON.stringify(sendTransactionResponse, null, 2)}`
    );
  }

  return getTransactionResponse;
}
