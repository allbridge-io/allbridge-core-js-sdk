import { contract, rpc } from "@stellar/stellar-sdk";
import Api = rpc.Api;
import AssembledTransaction = contract.AssembledTransaction;
import SentTransaction = contract.SentTransaction;

export function getViewResultSoroban<T>(assembledTx: AssembledTransaction<T>): T | undefined {
  const { simulation, options } = assembledTx;
  if (!simulation) {
    throw new Error("Soroban assembled transaction does not have simulation");
  }

  if (Api.isSimulationSuccess(simulation)) {
    if (simulation.result == null) {
      return;
    }
    return options.parseResultXdr(simulation.result.retval);
  } else {
    throw new Error(simulation.error);
  }
}

export function isErrorSorobanResult<T>(assembledTx: AssembledTransaction<T>): boolean {
  const { simulation } = assembledTx;
  if (!simulation) {
    throw new Error("Soroban assembled transaction does not have simulation");
  }
  return Api.isSimulationError(simulation);
}

export async function signAndSendSoroban<T>(assembledTx: AssembledTransaction<T>): Promise<SentTransaction<T>> {
  await assembledTx.simulate({ restore: true });
  return assembledTx.signAndSend();
}
