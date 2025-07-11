import { Transaction } from "@mysten/sui/transactions";
import { AllbridgeCoreSdkOptions, RawSuiTransaction } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";

/**
 * Contains usefully Sui methods
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
  keyMap = {
    SplitCoins: "amounts",
    MoveCall: "arguments",
    MergeCoins: "sources",
    TransferObjects: "objects",
    MakeMoveVec: "elements",
    Upgrade: "ticket",
  } as const;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  private offset(obj: any, offsetInput: number, offsetCmd: number): { [key: string]: number | [number, number] } {
    if (obj.Input !== undefined) {
      obj.Input = obj.Input + offsetInput;
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

  async merge(bridgeTransaction: RawSuiTransaction, customTransaction: string): Promise<RawSuiTransaction> {
    const rawTx = JSON.parse(bridgeTransaction);
    const offsetInput = rawTx.inputs.length;
    const offsetCommands = rawTx.commands.length;
    const customTx = JSON.parse(customTransaction);
    rawTx.inputs = rawTx.inputs.concat(customTx.inputs);
    for (const cmd of customTx.commands) {
      const kind = Object.keys(cmd)[0] as string;
      const argKey = this.keyMap[kind as keyof typeof this.keyMap];
      if (!argKey) continue;

      const args = cmd[kind][argKey];
      if (!Array.isArray(args)) continue;
      cmd[kind][argKey] = args.map((arg: any) => this.offset(arg, offsetInput, offsetCommands));
      rawTx.commands.push(cmd);
    }

    const tx = Transaction.from(JSON.stringify(rawTx));
    return tx.toJSON();
  }
}
