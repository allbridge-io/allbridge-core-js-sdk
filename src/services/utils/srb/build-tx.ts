import type { Transaction } from "stellar-sdk";
import {
  Address,
  BASE_FEE,
  Contract,
  Operation,
  SorobanRpc,
  TimeoutInfinite,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import type { ClassOptions, MethodOptions } from "./method-options";

export type Tx = Transaction;

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

type XDRTransactionBuilderOptions<T = string> = MethodOptions &
  ClassOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: string | xdr.ScVal | Err) => T;
    account: string;
  };

export class XDRTransactionBuilder<T> {
  // @ts-expect-error cannot be undefined
  public raw: Tx;
  private simulation?: SorobanRpc.Api.SimulateTransactionResponse;
  private server: SorobanRpc.Server;

  private constructor(public options: XDRTransactionBuilderOptions<T>) {
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.rpcUrl.startsWith("http://"),
    });
  }

  static async xdrFromSimulation<T>(options: XDRTransactionBuilderOptions<T>): Promise<string> {
    const tx = new XDRTransactionBuilder(options);
    const contract = new Contract(options.contractId);

    tx.raw = new TransactionBuilder(await tx.server.getAccount(options.account), {
      fee: options.fee?.toString(10) ?? BASE_FEE,
      networkPassphrase: options.networkPassphrase,
    })
      .addOperation(contract.call(options.method, ...(options.args ?? [])))
      .setTimeout(TimeoutInfinite)
      .build();

    const assembledTransaction = await tx.simulate();
    const op = assembledTransaction.raw.operations[0] as Operation.InvokeHostFunction;

    assembledTransaction.raw = new TransactionBuilder(await tx.server.getAccount(options.account), {
      fee: assembledTransaction.raw.fee,
      networkPassphrase: options.networkPassphrase,
    })
      .setTimeout(TimeoutInfinite)
      .addOperation(Operation.invokeHostFunction({ ...op, auth: op.auth ?? [] }))
      .build();

    await assembledTransaction.simulate();
    return assembledTransaction.raw.toXDR();
  }

  simulate = async (): Promise<this> => {
    this.simulation = await this.server.simulateTransaction(this.raw);

    if (SorobanRpc.Api.isSimulationSuccess(this.simulation)) {
      this.raw = SorobanRpc.assembleTransaction(this.raw, this.simulation).build();
    }

    return this;
  };
}
