import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction } from "@mysten/sui/transactions";
import { Reified, toBcs, ToJSON, TypeArgument } from "../../models/sui/_framework/reified";

const mockSender = "0x0000000000000000000000000000000000000000000000000000000000000000";
/** No gas coins are attached to a view call: the budget is only the simulation's upper bound. */
const VIEW_GAS_BUDGET = 50_000_000;

/**
 * Simulates `tx` (no gas coins, zero sender, checks disabled) and decodes the last return value of its last command,
 * the gRPC replacement of the JSON-RPC `devInspectTransactionBlock`.
 */
export async function suiView<T extends TypeArgument>(
  client: SuiGrpcClient,
  tx: Transaction,
  reified: Reified<T, any>
): Promise<ToJSON<T>> {
  tx.setSenderIfNotSet(mockSender);
  tx.setGasPayment([]);
  tx.setGasBudget(VIEW_GAS_BUDGET);
  const bytes = await tx.build({ client });
  const result = await client.core.simulateTransaction({
    transaction: bytes,
    include: { commandResults: true },
    checksEnabled: false,
  });
  if (result.$kind === "FailedTransaction") {
    throw new Error(`Sui view failed. ${JSON.stringify(result.FailedTransaction.status, null, 2)}`);
  }

  const data = result.commandResults?.at(-1)?.returnValues?.at(-1)?.bcs;

  if (!data) {
    throw new Error(`Something with Sui view went wrong. ${JSON.stringify(result, null, 2)}`);
  }

  if (typeof reified === "object") {
    return reified.fromBcs(Uint8Array.from(data)).toJSONField() as ToJSON<T>;
  } else {
    return toBcs(reified).parse(Uint8Array.from(data));
  }
}
