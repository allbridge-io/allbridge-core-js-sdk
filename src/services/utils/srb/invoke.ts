import * as SorobanClient from "soroban-client";
import { SorobanRpc } from "soroban-client";
import type { Transaction, xdr } from "soroban-client";
import { SdkError } from "../../../exceptions";
import type { ClassOptions, MethodOptions, ResponseTypes } from "../../models/srb/method-options.js";

export type Tx = Transaction;

type Simulation = SorobanRpc.SimulateTransactionResponse;
type SendTx = SorobanRpc.SendTransactionResponse;
type GetTx = SorobanRpc.GetTransactionResponse;

// defined this way so typeahead shows full union, not named alias
let someRpcResponse: Simulation | SendTx | GetTx;
type SomeRpcResponse = typeof someRpcResponse;

type InvokeArgs<R extends ResponseTypes, T = string> = MethodOptions<R> &
  ClassOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: string | xdr.ScVal) => T;
  };

/**
 * Invoke a method on the test_custom_types contract.
 *
 * Uses Freighter to determine the current user and if necessary sign the transaction.
 *
 * @returns {T}, by default, the parsed XDR from either the simulation or the full transaction. If `simulateOnly` or `fullRpcResponse` are true, returns either the full simulation or the result of sending/getting the transaction to/from the ledger.
 */
export async function invoke<R extends ResponseTypes = undefined, T = string>(
  args: InvokeArgs<R, T>
): Promise<R extends undefined ? T : R extends "simulated" ? Simulation : R extends "full" ? SomeRpcResponse : T>;
export async function invoke<R extends ResponseTypes, T = string>({
  method,
  args = [],
  fee = 100,
  responseType,
  parseResultXdr,
  rpcUrl,
  networkPassphrase,
  contractId,
}: InvokeArgs<R, T>): Promise<T | string | SomeRpcResponse> {
  const server = new SorobanClient.Server(rpcUrl, {
    allowHttp: rpcUrl.startsWith("http://"),
  });

  // use a placeholder null account if not yet connected to Freighter so that view calls can still work
  const account = new SorobanClient.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"); // cSpell:disable-line

  const contract = new SorobanClient.Contract(contractId);

  const tx = new SorobanClient.TransactionBuilder(account, {
    fee: fee.toString(10),
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build();
  const simulated = await server.simulateTransaction(tx);

  if (SorobanRpc.isSimulationError(simulated)) {
    throw new SdkError(simulated.error);
  } else if (responseType === "simulated") {
    return simulated;
  } else if (!simulated.result) {
    throw new SdkError(`invalid simulation: no result for \`simulated\` transaction`);
  }

  if (responseType === "full") {
    return simulated;
  }
  return parseResultXdr(simulated.result.retval);
}
