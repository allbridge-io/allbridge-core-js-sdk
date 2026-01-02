import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Big } from "big.js";
import { TxTooLargeError } from "../../../exceptions";
import { toPowBase10 } from "../../../utils/calculation";
import { fetchAddressLookupTableAccountsFromTx } from "../../../utils/sol/utils";
import { SolanaAutoTxFee, SolanaTxFee, SolanaTxFeeParams, TxFeeParams } from "../../models";

export async function addUnitLimitAndUnitPriceToTx(
  transaction: Transaction,
  txFeeParams: TxFeeParams | undefined,
  solanaRpcUrl: string
) {
  const connection = new Connection(solanaRpcUrl, "confirmed");
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const simUnitsConsumed = (await connection.simulateTransaction(transaction)).value.unitsConsumed!;
  await addUnitLimitAndUnitPriceToInstructions(transaction.instructions, simUnitsConsumed, txFeeParams, connection);
}

export async function addUnitLimitAndUnitPriceToVersionedTx(
  transaction: VersionedTransaction,
  txFeeParams: TxFeeParams | undefined,
  solanaRpcUrl: string
) {
  const connection = new Connection(solanaRpcUrl, "confirmed");
  const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
  const message = TransactionMessage.decompile(transaction.message, {
    addressLookupTableAccounts: addressLookupTableAccounts,
  });

  if (transaction.serialize().length > 1232) {
    throw new TxTooLargeError();
  }

  // const simUnitsConsumed = (await connection.simulateTransaction(transaction, { replaceRecentBlockhash: true })).value
  //   .unitsConsumed!;
  const simUnitsConsumed = 769230; // 1000000/1.3

  await addUnitLimitAndUnitPriceToInstructions(message.instructions, simUnitsConsumed, txFeeParams, connection);

  transaction.message = message.compileToV0Message(addressLookupTableAccounts);
}

async function addUnitLimitAndUnitPriceToInstructions(
  instructions: TransactionInstruction[],
  simUnitsConsumed: number,
  txFeeParams: TxFeeParams | undefined,
  connection: Connection
) {
  if (simUnitsConsumed <= 0) return;

  const units = updateUnitLimit(simUnitsConsumed, instructions);

  const solanaFeeParams = normalizeSolanaTxFeeParams(txFeeParams?.solana);
  const solanaFee = solanaFeeParams?.fee;

  // If a fee is not provided, treat it as an auto fee calculation.
  if (!solanaFee || solanaFee === SolanaAutoTxFee) {
    await updateUnitPrice(instructions, connection);
    return;
  }

  if ("pricePerUnitInMicroLamports" in solanaFee) {
    await updateUnitPrice(instructions, connection, solanaFee.pricePerUnitInMicroLamports);
    return;
  }

  // Extra fee in lamports -> convert to microLamports per compute unit
  const pricePerUnitInMicroLamports = Big(solanaFee.extraFeeInLamports).div(units).mul(toPowBase10(6)).toFixed(0);

  await updateUnitPrice(instructions, connection, pricePerUnitInMicroLamports);
}

export function normalizeSolanaTxFeeParams(solana?: SolanaTxFee | SolanaTxFeeParams): SolanaTxFeeParams {
  if (!solana) return {};

  // Legacy format (non-object)
  if (typeof solana !== "object") {
    return { fee: solana };
  }

  // Legacy format (object)
  if ("pricePerUnitInMicroLamports" in solana || "extraFeeInLamports" in solana) {
    return { fee: solana };
  }

  // New format
  if ("fee" in solana || "payTxFeeWithStablecoinSwap" in solana) {
    return solana;
  }

  return {};
}

function updateUnitLimit(simUnitsConsumed: number, instructions: TransactionInstruction[]): string {
  const computeUnitLimitIndex = instructions.findIndex(
    (instruction) =>
      instruction.programId.equals(ComputeBudgetProgram.programId) &&
      ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitLimit"
  );
  const units = Number((simUnitsConsumed * 1.3).toFixed(0));
  const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: units,
  });
  if (computeUnitLimitIndex >= 0) {
    instructions[computeUnitLimitIndex] = computeUnitLimitInstruction;
  } else {
    instructions.push(computeUnitLimitInstruction);
  }
  return units.toString();
}

async function updateUnitPrice(
  instructions: TransactionInstruction[],
  connection: Connection,
  pricePerUnitInMicroLamports?: string
): Promise<string> {
  const computeUnitPriceIndex = instructions.findIndex(
    (instruction) =>
      instruction.programId.equals(ComputeBudgetProgram.programId) &&
      ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitPrice"
  );
  const unitPrice = pricePerUnitInMicroLamports
    ? BigInt(pricePerUnitInMicroLamports)
    : BigInt(await getAveragePrioritizationFee(connection));
  const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: unitPrice,
  });
  if (computeUnitPriceIndex >= 0) {
    instructions[computeUnitPriceIndex] = computeUnitPriceInstruction;
  } else {
    instructions.push(computeUnitPriceInstruction);
  }
  return unitPrice.toString();
}

async function getAveragePrioritizationFee(connection: Connection) {
  const prioritizationFees = await connection.getRecentPrioritizationFees();
  let sum = 0;
  for (const prioritizationFee of prioritizationFees) {
    sum += prioritizationFee.prioritizationFee;
  }
  return (sum / prioritizationFees.length).toFixed(0);
}
