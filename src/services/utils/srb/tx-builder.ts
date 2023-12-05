import * as SorobanClient from "soroban-client";
import { Address, SorobanRpc } from "soroban-client";
import type { Transaction } from "soroban-client";
import { SdkError, TimeoutError } from "../../../exceptions";
import type { ClassOptions } from "../../models/srb/method-options.js";

export type Tx = Transaction;

type InvokeArgs = ClassOptions & {
  sender: Address;
  method: string;
  args?: any[];
};
const FEE = 100;

export async function xdrTxBuilder(args: InvokeArgs): Promise<string>;
export async function xdrTxBuilder({
  sender,
  method,
  args = [],
  rpcUrl,
  networkPassphrase,
  contractId,
}: InvokeArgs): Promise<string> {
  const server = new SorobanClient.Server(rpcUrl);
  const account = await server.getAccount(sender.toString());
  const contract = new SorobanClient.Contract(contractId);

  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: FEE.toString(10),
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (SorobanRpc.isSimulationError(simulated)) {
    throw new SdkError(simulated.error);
  } else if (!simulated.result) {
    throw new SdkError(`invalid simulation: no result for \`simulated\` transaction`);
  }

  return SorobanClient.assembleTransaction(tx, networkPassphrase, simulated).build().toXDR();
}

export async function confirmTx(
  hash: string,
  secondsToWait: number,
  server: SorobanClient.Server
): Promise<SorobanRpc.GetTransactionResponse> {
  let getTransactionResponse = await server.getTransaction(hash);

  const waitUntil = new Date(Date.now() + secondsToWait * 1000).valueOf();

  let waitTime = 1000;
  const exponentialFactor = 1.5;

  while (Date.now() < waitUntil && getTransactionResponse.status === SorobanRpc.GetTransactionStatus.NOT_FOUND) {
    // Wait a beat
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    /// Exponential backoff
    waitTime = waitTime * exponentialFactor;
    // See if the transaction is complete
    getTransactionResponse = await server.getTransaction(hash);
  }

  if (getTransactionResponse.status === SorobanRpc.GetTransactionStatus.NOT_FOUND) {
    throw new TimeoutError(
      `Waited ${secondsToWait} seconds for transaction to complete, but it did not. ` +
        `Returning anyway. Check the transaction status manually. ` +
        `Info: ${JSON.stringify(hash, null, 2)}`
    );
  }
  return getTransactionResponse;
}
