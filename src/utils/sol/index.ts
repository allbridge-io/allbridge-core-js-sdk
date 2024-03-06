import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Big } from "big.js";
import { AllbridgeCoreSdkOptions, ChainSymbol, SdkError } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { toPowBase10 } from "../calculation";
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
   * - ComputeUnitPrice will be added/updated for extra fee impact will be as extraFeeInLamports param
   * @param transaction
   * @param extraFeeInLamports extra fee
   * @return extra fee in Lamports
   */
  addPriorityFeeToTx(transaction: VersionedTransaction, extraFeeInLamports: string): Promise<string>;

  /**
   * Add Priority Fee to solana's VersionedTransaction
   * - ComputeUnitLimit will be added/updated with actual data from the simulation
   * - ComputeUnitPrice will be added/updated with priorityFeePricePerUnitInMicroLamports param
   * @param transaction
   * @param pricePerUnitInMicroLamports price per unit in micro-lamports </br> Optional. Will be calculated throw {@link Connection#getRecentPrioritizationFees}
   * @return extra fee in Lamports
   */
  addPriorityFeePerUnitToTx(transaction: VersionedTransaction, pricePerUnitInMicroLamports?: string): Promise<string>;
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

  async addPriorityFeePerUnitToTx(
    transaction: VersionedTransaction,
    pricePerUnitInMicroLamports?: string
  ): Promise<string> {
    const connection = new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });

    const units = await this.updateUnitLimit(transaction, message, connection);
    const unitPrice = await this.updateUnitPrice(message, connection, pricePerUnitInMicroLamports);

    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
    return Big(unitPrice).mul(units).div(toPowBase10(6)).toFixed(0);
  }

  async addPriorityFeeToTx(transaction: VersionedTransaction, extraFeeInLamports: string): Promise<string> {
    const connection = new Connection(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), "confirmed");
    const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, connection);
    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });

    const units = await this.updateUnitLimit(transaction, message, connection);
    const unitPrice = await this.updateUnitPrice(
      message,
      connection,
      Big(extraFeeInLamports).div(units).mul(toPowBase10(6)).toFixed(0)
    );

    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
    return Big(unitPrice).mul(units).div(toPowBase10(6)).toFixed(0);
  }

  private async updateUnitLimit(
    transaction: VersionedTransaction,
    message: TransactionMessage,
    connection: Connection
  ): Promise<string> {
    const computeUnitLimitIndex = message.instructions.findIndex(
      (instruction) =>
        instruction.programId.equals(ComputeBudgetProgram.programId) &&
        ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitLimit"
    );
    const simUnitsConsumed = (await connection.simulateTransaction(transaction)).value.unitsConsumed!;
    const units = Number((simUnitsConsumed * 1.3).toFixed(0));
    const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
      units: units,
    });
    if (computeUnitLimitIndex >= 0) {
      message.instructions[computeUnitLimitIndex] = computeUnitLimitInstruction;
    } else {
      message.instructions.push(computeUnitLimitInstruction);
    }
    return units.toString();
  }

  private async updateUnitPrice(
    message: TransactionMessage,
    connection: Connection,
    pricePerUnitInMicroLamports?: string
  ): Promise<string> {
    const computeUnitPriceIndex = message.instructions.findIndex(
      (instruction) =>
        instruction.programId.equals(ComputeBudgetProgram.programId) &&
        ComputeBudgetInstruction.decodeInstructionType(instruction) === "SetComputeUnitPrice"
    );
    const unitPrice = pricePerUnitInMicroLamports
      ? BigInt(pricePerUnitInMicroLamports)
      : BigInt(await this.getAveragePrioritizationFee(connection));
    const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: unitPrice,
    });
    if (computeUnitPriceIndex >= 0) {
      message.instructions[computeUnitPriceIndex] = computeUnitPriceInstruction;
    } else {
      message.instructions.push(computeUnitPriceInstruction);
    }
    return unitPrice.toString();
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
