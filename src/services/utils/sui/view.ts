import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Reified, toBcs, ToJSON, TypeArgument } from "../../models/sui/_framework/reified";

const mockSender = "0x0000000000000000000000000000000000000000000000000000000000000000";

export async function suiView<T extends TypeArgument>(
  client: SuiClient,
  tx: Transaction,
  reified: Reified<T, any>
): Promise<ToJSON<T>> {
  const inspectionResult = await client.devInspectTransactionBlock({
    sender: mockSender,
    transactionBlock: tx,
  });
  if (inspectionResult.effects.status.status !== "success") {
    throw new Error(`inspectionResult failed. ${JSON.stringify(inspectionResult, null, 2)}`);
  }

  const returnValue = inspectionResult.results?.pop()?.returnValues?.pop();

  if (!returnValue) {
    throw new Error(`Something with inspectionResult went wrong. ${JSON.stringify(inspectionResult, null, 2)}`);
  }

  const [data, _type] = returnValue;

  if (typeof reified === "object") {
    return reified.fromBcs(Uint8Array.from(data)).toJSONField() as ToJSON<T>;
  } else {
    return toBcs(reified).parse(Uint8Array.from(data));
  }
}
