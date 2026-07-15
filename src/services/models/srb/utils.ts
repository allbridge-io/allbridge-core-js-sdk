import { contract, rpc } from "@stellar/stellar-sdk";
import Api = rpc.Api;
import AssembledTransaction = contract.AssembledTransaction;
import SentTransaction = contract.SentTransaction;

/**
 * Fallback inclusion fee (in stroops) used when fee stats are unavailable.
 * Matches the stellar-sdk `BASE_FEE` default.
 */
export const DEFAULT_INCLUSION_FEE = 100;

/**
 * Fetches the current network fee stats and derives an inclusion-fee bid (in stroops).
 *
 * We bid `max(p90 * 2, mode, DEFAULT_INCLUSION_FEE)`: the p90 * 2 headroom protects
 * against congestion while the actual charge stays the clearing price, so overbidding
 * is safe. On any RPC error we fall back to {@link DEFAULT_INCLUSION_FEE}.
 *
 * @param rpcUrl Soroban RPC url (the `getFeeStats` endpoint exposes both distributions)
 * @param kind `sorobanInclusionFee` for Soroban txs, `inclusionFee` for classic Stellar txs
 */
async function getInclusionFeeBid(
  rpcUrl: string,
  kind: "sorobanInclusionFee" | "inclusionFee"
): Promise<number> {
  try {
    const server = new rpc.Server(rpcUrl);
    const stats = await server.getFeeStats();
    const distribution = stats[kind];
    const candidates = [Number(distribution.p90) * 2, Number(distribution.mode)].filter(
      (value) => Number.isFinite(value) && value > 0
    );
    return Math.ceil(Math.max(...candidates, DEFAULT_INCLUSION_FEE));
  } catch {
    return DEFAULT_INCLUSION_FEE;
  }
}

/**
 * Inclusion-fee bid (in stroops) for Soroban (smart-contract) transactions.
 */
export function getSorobanInclusionFee(rpcUrl: string): Promise<number> {
  return getInclusionFeeBid(rpcUrl, "sorobanInclusionFee");
}

/**
 * Inclusion-fee bid (in stroops) for classic Stellar transactions (e.g. changeTrust).
 */
export function getStellarInclusionFee(rpcUrl: string): Promise<number> {
  return getInclusionFeeBid(rpcUrl, "inclusionFee");
}

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
