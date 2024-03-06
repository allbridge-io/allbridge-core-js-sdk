import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { AllbridgeCoreSdkOptions, ChainSymbol, SdkError } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { fetchAddressLookupTableAccountsFromTx } from "./utils";

/**
 * Contains usefully Solana methods
 */
export interface SolUtils {
  /**
   * Add memo to solana's transaction
   * @param transaction transaction to add memo
   * @param memo memo to add (28 char max)
   */
  addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void>;

  /**
   * Add Priority Fee to solana's VersionedTransaction
   * - ComputeUnitLimit will be added/updated with actual data from the simulation
   * - ComputeUnitPrice will be added/updated with priorityFeePricePerUnitInMicroLamports param
   * @param transaction
   * @param priorityFeePricePerUnitInMicroLamports price per unit in micro-lamports </br> Optional. Will be calculated throw {@link Connection#getRecentPrioritizationFees}
   */
  addPriorityFeeToTx(transaction: VersionedTransaction, priorityFeePricePerUnitInMicroLamports?: string): Promise<void>;
}

export class DefaultSolUtils implements SolUtils {
  constructor(readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig, readonly params: AllbridgeCoreSdkOptions) {}

  async addMemoToTx(transaction: VersionedTransaction, memo: string): Promise<void> {
    if (memo.length > 28) {
      throw new SdkError("InvalidArgumentException memo cannot be more than 28 characters");
    }
    const connection = new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });
    message.instructions[message.instructions.length - 1].keys.push({
      pubkey: new PublicKey(Buffer.from(memo)),
      isSigner: false,
      isWritable: false,
    });
    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
  }

  async addPriorityFeeToTx(
    transaction: VersionedTransaction,
    priorityFeePricePerUnitInMicroLamports?: string
  ): Promise<void> {
    const connection = new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });

    //update UnitLimit Instruction
    const computeUnitLimitIndex = message.instructions.findIndex(
      (instruction) =>
        instruction.programId.equals(ComputeBudgetProgram.programId) &&
        ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitLimit"
    );
    const simUnitsConsumed = (await connection.simulateTransaction(transaction)).value.unitsConsumed;
    if (simUnitsConsumed) {
      const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
        units: Number((simUnitsConsumed * 1.3).toFixed(0)),
      });
      if (computeUnitLimitIndex >= 0) {
        message.instructions[computeUnitLimitIndex] = computeUnitLimitInstruction;
      } else {
        message.instructions.splice(0, 0, computeUnitLimitInstruction);
      }
    }

    //update UnitPrice Instruction
    const computeUnitPriceIndex = message.instructions.findIndex(
      (instruction) =>
        instruction.programId.equals(ComputeBudgetProgram.programId) &&
        ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitPrice"
    );
    const unitPrice = priorityFeePricePerUnitInMicroLamports
      ? BigInt(priorityFeePricePerUnitInMicroLamports)
      : BigInt(await this.getAveragePrioritizationFee(connection));
    const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: unitPrice,
    });
    if (computeUnitPriceIndex >= 0) {
      message.instructions[computeUnitPriceIndex] = computeUnitPriceInstruction;
    } else {
      message.instructions.splice(computeUnitLimitIndex + 1, 0, computeUnitPriceInstruction);
    }

    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
  }

  private async getAveragePrioritizationFee(connection: Connection) {
    const prioritizationFees = await connection.getRecentPrioritizationFees();
    let sum = 0;
    for (const prioritizationFee of prioritizationFees) {
      sum += prioritizationFee.prioritizationFee;
    }
    return (sum / prioritizationFees.length).toFixed(0);
  }
}
