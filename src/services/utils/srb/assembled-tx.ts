/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Transaction } from "stellar-sdk";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import type { ClassOptions, MethodOptions } from "./method-options";

export type Tx = Transaction;

export class ExpiredStateError extends Error {}

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;
export { Address };

/// Error interface containing the error message
export interface Error_ {
  message: string;
}

export interface Result<T, E extends Error_> {
  unwrap(): T;
  unwrapErr(): E;
  isOk(): boolean;
  isErr(): boolean;
}

export class Ok<T, E extends Error_ = Error_> implements Result<T, E> {
  constructor(readonly value: T) {}
  unwrapErr(): E {
    throw new Error("No error");
  }
  unwrap(): T {
    return this.value;
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return !this.isOk();
  }
}

export class Err<E extends Error_ = Error_> implements Result<any, E> {
  constructor(readonly error: E) {}
  unwrapErr(): E {
    return this.error;
  }
  unwrap(): never {
    throw new Error(this.error.message);
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return !this.isOk();
  }
}

export const contractErrorPattern = /Error\(Contract, #(\d+)\)/;

type AssembledTransactionOptions<T = string> = MethodOptions &
  ClassOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: string | xdr.ScVal | Err) => T;
  };

export const NULL_ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export class AssembledTransaction<T> {
  // @ts-expect-error
  public raw: Tx;
  private simulation?: SorobanRpc.Api.SimulateTransactionResponse;
  private simulationResult?: SorobanRpc.Api.SimulateHostFunctionResult;
  private simulationTransactionData?: xdr.SorobanTransactionData;
  private server: SorobanRpc.Server;

  private constructor(public options: AssembledTransactionOptions<T>) {
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.rpcUrl.startsWith("http://"),
    });
  }

  static async fromSimulation<T>(options: AssembledTransactionOptions<T>): Promise<AssembledTransaction<T>> {
    const tx = new AssembledTransaction(options);
    const contract = new Contract(options.contractId);

    tx.raw = new TransactionBuilder(tx.getAccount(), {
      fee: options.fee?.toString(10) ?? BASE_FEE,
      networkPassphrase: options.networkPassphrase,
    })
      .addOperation(contract.call(options.method, ...(options.args ?? [])))
      .setTimeout(TimeoutInfinite)
      .build();

    return await tx.simulate();
  }

  simulate = async (): Promise<this> => {
    this.simulation = await this.server.simulateTransaction(this.raw);

    if (SorobanRpc.Api.isSimulationSuccess(this.simulation)) {
      this.raw = SorobanRpc.assembleTransaction(this.raw, this.simulation).build();
    }

    return this;
  };

  get simulationData(): {
    result: SorobanRpc.Api.SimulateHostFunctionResult;
    transactionData: xdr.SorobanTransactionData;
  } {
    if (this.simulationResult && this.simulationTransactionData) {
      return {
        result: this.simulationResult,
        transactionData: this.simulationTransactionData,
      };
    }
    // else, we know we just did the simulation on this machine
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const simulation = this.simulation!;
    if (SorobanRpc.Api.isSimulationError(simulation)) {
      throw new Error(`Transaction simulation failed: "${simulation.error}"`);
    }

    if (SorobanRpc.Api.isSimulationRestore(simulation)) {
      throw new ExpiredStateError(
        `You need to restore some contract state before you can invoke this method. ${JSON.stringify(
          simulation,
          null,
          2
        )}`
      );
    }

    if (!simulation.result) {
      throw new Error(
        `Expected an invocation simulation, but got no 'result' field. Simulation: ${JSON.stringify(
          simulation,
          null,
          2
        )}`
      );
    }

    // add to object for serialization & deserialization
    this.simulationResult = simulation.result;
    this.simulationTransactionData = simulation.transactionData.build();

    return {
      result: this.simulationResult,
      transactionData: this.simulationTransactionData,
    };
  }

  get result(): T {
    try {
      return this.options.parseResultXdr(this.simulationData.result.retval);
    } catch (e) {
      // @ts-expect-error
      const err = this.parseError(e.toString());
      if (err) return err as T;
      throw e;
    }
  }

  parseError(errorMessage: string): Err | undefined {
    if (!this.options.errorTypes) return;
    const match = errorMessage.match(contractErrorPattern);
    if (!match) return;
    const i = parseInt(match[1], 10);
    const err = this.options.errorTypes[i];
    if (err.message) return new Err(err);
  }

  /**
   * Get account details from the Soroban network for the publicKey currently
   * selected in user's wallet. If not connected to Freighter, use placeholder
   * null account.
   */
  getAccount = (): Account => {
    // const publicKey = await this.getPublicKey();
    // return publicKey
    //   ? await this.server.getAccount(publicKey)
    //   : new Account(NULL_ACCOUNT, '0')
    return new Account(NULL_ACCOUNT, "0");
  };
}
