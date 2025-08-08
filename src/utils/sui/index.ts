import { Transaction } from "@mysten/sui/transactions";
import { AllbridgeCoreSdkOptions, RawSuiTransaction } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";

/**
 * Contains useful Sui methods
 */
export interface SuiUtils {
  /**
   * merge Sui's transactions
   * @param bridgeTransaction transaction to merge with
   * @param customTransaction custom transaction to merge with the bridge transaction
   */
  merge(bridgeTransaction: RawSuiTransaction, customTransaction: string): Promise<RawSuiTransaction>;
}

export class DefaultSuiUtils implements SuiUtils {
  private readonly keyMap = {
    SplitCoins: ["amounts", "coin"],
    MoveCall: ["arguments"],
    MergeCoins: ["sources"],
    TransferObjects: ["objects"],
    MakeMoveVec: ["elements"],
    Upgrade: ["ticket"],
  } as const;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  private offset(
    obj: any,
    inputIndexMap: Map<number, number>,
    offsetCmd: number
  ): { [key: string]: number | [number, number] } {
    if (obj.Input !== undefined) {
      obj.Input = inputIndexMap.get(obj.Input);
      return obj;
    }
    if (obj.NestedResult !== undefined) {
      obj.NestedResult = [obj.NestedResult[0] + offsetCmd, obj.NestedResult[1]];
      return obj;
    }
    if (obj.Result !== undefined) {
      obj.Result = obj.Result + offsetCmd;
      return obj;
    }
    return obj;
  }

  private getInputObjectId(input: any): string | undefined {
    if ("UnresolvedObject" in input && input.UnresolvedObject?.objectId) {
      return input.UnresolvedObject.objectId;
    }
    if ("Object" in input) {
      const obj = input.Object;
      if ("ImmOrOwnedObject" in obj) {
        return obj.ImmOrOwnedObject.objectId;
      }
      if ("SharedObject" in obj) {
        return obj.SharedObject.objectId;
      }
      if ("Receiving" in obj) {
        return obj.Receiving.objectId;
      }
    }
    return undefined;
  }

  async merge(bridgeTransaction: RawSuiTransaction, customTransaction: string): Promise<RawSuiTransaction> {
    const rawTx = JSON.parse(bridgeTransaction);
    const customTx = JSON.parse(customTransaction);
    const offsetCommands = customTx.commands.length;

    const objectIdToIndex = new Map<string, number>();
    const inputIndexMap = new Map<number, number>();

    customTx.inputs.forEach((input: any, index: number) => {
      const objectId = this.getInputObjectId(input);
      if (objectId) objectIdToIndex.set(objectId, index);
    });

    rawTx.inputs.forEach((input: any, index: number) => {
      const objectId = this.getInputObjectId(input);
      if (objectId && objectIdToIndex.has(objectId)) {
        inputIndexMap.set(index, objectIdToIndex.get(objectId) as number);
      } else {
        const newIndex = customTx.inputs.length;
        customTx.inputs.push(input);
        inputIndexMap.set(index, newIndex);
        if (objectId) objectIdToIndex.set(objectId, newIndex);
      }
    });

    for (const cmd of rawTx.commands) {
      const kind = Object.keys(cmd)[0] as string;
      const argKeys = this.keyMap[kind as keyof typeof this.keyMap];
      if (!argKeys) continue;
      for (const argKey of argKeys) {
        const args = cmd[kind][argKey];
        if (!Array.isArray(args)) {
          cmd[kind][argKey] = this.offset(args, inputIndexMap, offsetCommands);
        } else {
          cmd[kind][argKey] = args.map((arg: any) => this.offset(arg, inputIndexMap, offsetCommands));
        }
      }
      customTx.commands.push(cmd);
    }

    const cleanedTx = this.cleanupTransaction(customTx);
    return Transaction.from(JSON.stringify(cleanedTx)).toJSON();
  }

  private cleanupTransaction(tx: any): RawSuiTransaction {
    const usedInputs = new Set<number>();
    const usedResults = new Set<number>();
    const keepCommands: any[] = [];
    const oldToNewCmdIdx = new Map<number, number>();

    const visit = (obj: any) => {
      if (obj?.Input !== undefined) usedInputs.add(obj.Input);
      if (obj?.Result !== undefined) usedResults.add(obj.Result);
      if (obj?.NestedResult !== undefined) usedResults.add(obj.NestedResult[0]);
    };
    const remapCmd = (obj: any): any => {
      if (obj?.Result !== undefined) {
        const newIdx = oldToNewCmdIdx.get(obj.Result);
        return newIdx !== undefined ? { Result: newIdx } : obj;
      }
      if (obj?.NestedResult !== undefined) {
        const newIdx = oldToNewCmdIdx.get(obj.NestedResult[0]);
        return newIdx !== undefined ? { NestedResult: [newIdx, obj.NestedResult[1]] } : obj;
      }
      return obj;
    };

    const remapInput = (obj: any): any => {
      if (obj?.Input !== undefined) {
        const newIdx = inputMap.get(obj.Input);
        return newIdx !== undefined ? { Input: newIdx } : obj;
      }
      return obj;
    };

    for (const cmd of tx.commands) {
      const kind = Object.keys(cmd)[0] as string;
      for (const v of Object.values(cmd[kind])) {
        if (Array.isArray(v)) {
          v.forEach(visit);
        } else {
          visit(v);
        }
      }
    }
    tx.commands.forEach((cmd: any, idx: number) => {
      const kind = Object.keys(cmd)[0] as string;
      const isDroppable = ["SplitCoins"].includes(kind);
      const isUsed = usedResults.has(idx);

      if (!isDroppable || isUsed) {
        oldToNewCmdIdx.set(idx, keepCommands.length);
        keepCommands.push(cmd);
      }
    });

    keepCommands.forEach((cmd: any, idx: number) => {
      const kind = Object.keys(cmd)[0] as string;
      for (const key of Object.keys(cmd[kind])) {
        const field = cmd[kind][key];
        keepCommands[idx][kind][key] = Array.isArray(field) ? field.map(remapCmd) : remapCmd(field);
      }
    });

    const inputMap = new Map<number, number>();
    const finalInputs = tx.inputs.filter((input: any, idx: number) => {
      if (usedInputs.has(idx)) {
        inputMap.set(idx, inputMap.size);
        return true;
      }
      return false;
    });

    keepCommands.forEach((cmd: any, idx: number) => {
      const kind = Object.keys(cmd)[0] as string;
      for (const key of Object.keys(cmd[kind])) {
        const field = cmd[kind][key];
        keepCommands[idx][kind][key] = Array.isArray(field) ? field.map(remapInput) : remapInput(field);
      }
    });

    return {
      ...tx,
      inputs: finalInputs,
      commands: keepCommands,
    };
  }
}
