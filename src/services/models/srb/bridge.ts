import { Address, ContractSpec } from "soroban-client";
import { SdkError } from "../../../exceptions";
import { xdrTxBuilder } from "../../utils/srb/tx-builder";
import type { ClassOptions } from "./method-options";

export * from "../../utils/srb/tx-builder";
export * from "./method-options";

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
    throw new SdkError("No error");
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
    throw new SdkError(this.error.message);
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return !this.isOk();
  }
}

export const networks = {
  futurenet: {
    networkPassphrase: "Test SDF Future Network ; October 2022",
    contractId: "CAXKSIMIIFKKHAQKM32QD4AYEXVLBYIQVUKPRAAUV5HNLTLXHSROM4AV",
  },
} as const;

export interface Bridge {
  /**
   * precomputed values of the scaling factor required for paying the bridging fee with stable tokens
   */
  bridging_fee_conversion_factor: Map<Address, u128>;
  can_swap: boolean;
  /**
   * precomputed values to divide by to change the precision from the Gas Oracle precision to the token precision
   */
  from_gas_oracle_factor: Map<Address, u128>;
  messenger: Address;
  pools: Map<Buffer, Address>;
  rebalancer: Address;
}

const Errors = {
  0: { message: "" },
  1: { message: "" },
  2: { message: "" },
  3: { message: "" },
  4: { message: "" },
  5: { message: "" },
  6: { message: "" },
  7: { message: "" },
  8: { message: "" },
  9: { message: "" },
  103: { message: "" },
  104: { message: "" },
  105: { message: "" },
  106: { message: "" },
  107: { message: "" },
  108: { message: "" },
  109: { message: "" },
  203: { message: "" },
  204: { message: "" },
  205: { message: "" },
  206: { message: "" },
  207: { message: "" },
  208: { message: "" },
  209: { message: "" },
  210: { message: "" },
  211: { message: "" },
  212: { message: "" },
  214: { message: "" },
  215: { message: "" },
  216: { message: "" },
  217: { message: "" },
  218: { message: "" },
  300: { message: "" },
  301: { message: "" },
  302: { message: "" },
  303: { message: "" },
  400: { message: "" },
};

export class BridgeContract {
  spec: ContractSpec;

  constructor(public readonly options: ClassOptions) {
    this.spec = new ContractSpec([
      "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAltZXNzZW5nZXIAAAAAAAATAAAAAAAAAApnYXNfb3JhY2xlAAAAAAATAAAAAAAAAAxuYXRpdmVfdG9rZW4AAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAPc3dhcF9hbmRfYnJpZGdlAAAAAAkAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAlyZWNpcGllbnQAAAAAAAPuAAAAIAAAAAAAAAAUZGVzdGluYXRpb25fY2hhaW5faWQAAAAEAAAAAAAAAA1yZWNlaXZlX3Rva2VuAAAAAAAD7gAAACAAAAAAAAAABW5vbmNlAAAAAAAADAAAAAAAAAAKZ2FzX2Ftb3VudAAAAAAACgAAAAAAAAAQZmVlX3Rva2VuX2Ftb3VudAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAAOcmVjZWl2ZV90b2tlbnMAAAAAAAkAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAA9zb3VyY2VfY2hhaW5faWQAAAAABAAAAAAAAAANcmVjZWl2ZV90b2tlbgAAAAAAA+4AAAAgAAAAAAAAAAVub25jZQAAAAAAAAwAAAAAAAAAEnJlY2VpdmVfYW1vdW50X21pbgAAAAAACgAAAAAAAAAJY2xhaW1hYmxlAAAAAAAAAQAAAAAAAAAJZXh0cmFfZ2FzAAAAAAAD6AAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAAEc3dhcAAAAAcAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAV0b2tlbgAAAAAAA+4AAAAgAAAAAAAAAA1yZWNlaXZlX3Rva2VuAAAAAAAD7gAAACAAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAAEnJlY2VpdmVfYW1vdW50X21pbgAAAAAACgAAAAAAAAAJY2xhaW1hYmxlAAAAAAAAAQAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAJc3RvcF9zd2FwAAAAAAAAAAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAKc3RhcnRfc3dhcAAAAAAAAAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAOc2V0X2dhc19vcmFjbGUAAAAAAAEAAAAAAAAAC25ld19hZGRyZXNzAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAASc2V0X3N0b3BfYXV0aG9yaXR5AAAAAAABAAAAAAAAAA5zdG9wX2F1dGhvcml0eQAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAOc2V0X3JlYmFsYW5jZXIAAAAAAAEAAAAAAAAACnJlYmFsYW5jZXIAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAANc2V0X21lc3NlbmdlcgAAAAAAAAEAAAAAAAAACW1lc3NlbmdlcgAAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAANc2V0X2dhc191c2FnZQAAAAAAAAIAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAAJZ2FzX3VzYWdlAAAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAPcmVnaXN0ZXJfYnJpZGdlAAAAAAIAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAAOYnJpZGdlX2FkZHJlc3MAAAAAA+4AAAAgAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAQYWRkX2JyaWRnZV90b2tlbgAAAAIAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAA+4AAAAgAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAATcmVtb3ZlX2JyaWRnZV90b2tlbgAAAAACAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAPuAAAAIAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAIYWRkX3Bvb2wAAAACAAAAAAAAAARwb29sAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAPuAAAAIAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAATd2l0aGRyYXdfZ2FzX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAfd2l0aGRyYXdfYnJpZGdpbmdfZmVlX2luX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAVaGFzX3Byb2Nlc3NlZF9tZXNzYWdlAAAAAAAAAQAAAAAAAAAHbWVzc2FnZQAAAAPuAAAAIAAAAAEAAAPpAAAAAQAAAAM=",
      "AAAAAAAAAAAAAAAUaGFzX3JlY2VpdmVkX21lc3NhZ2UAAAABAAAAAAAAAAdtZXNzYWdlAAAAA+4AAAAgAAAAAQAAA+kAAAABAAAAAw==",
      "AAAAAAAAAAAAAAAQZ2V0X3Bvb2xfYWRkcmVzcwAAAAEAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAPuAAAAIAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAPpAAAH0AAAAAZCcmlkZ2UAAAAAAAM=",
      "AAAAAAAAAAAAAAASZ2V0X3N0b3BfYXV0aG9yaXR5AAAAAAAAAAAAAQAAA+kAAAATAAAAAw==",
      "AAAAAAAAAAAAAAAUZ2V0X3RyYW5zYWN0aW9uX2Nvc3QAAAABAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAABAAAD6QAAAAoAAAAD",
      "AAAAAAAAAAAAAAANZ2V0X2dhc191c2FnZQAAAAAAAAEAAAAAAAAACGNoYWluX2lkAAAABAAAAAEAAAPpAAAACgAAAAM=",
      "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAAOZ2V0X2dhc19vcmFjbGUAAAAAAAAAAAABAAAD6QAAABMAAAAD",
      "AAAAAAAAAAAAAAASZ2V0X2Fub3RoZXJfYnJpZGdlAAAAAAABAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAABAAAD6QAAB9AAAAANQW5vdGhlckJyaWRnZQAAAAAAAAM=",
      "AAAAAQAAAAAAAAAAAAAAB1N3YXBwZWQAAAAABgAAAAAAAAAOcmVjZWl2ZV9hbW91bnQAAAAAAAoAAAAAAAAADXJlY2VpdmVfdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAALc2VuZF9hbW91bnQAAAAACgAAAAAAAAAKc2VuZF90b2tlbgAAAAAD7gAAACAAAAAAAAAABnNlbmRlcgAAAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAAClRva2Vuc1NlbnQAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAUZGVzdGluYXRpb25fY2hhaW5faWQAAAAEAAAAAAAAAAVub25jZQAAAAAAAAwAAAAAAAAADXJlY2VpdmVfdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAD7gAAACA=",
      "AAAAAQAAAAAAAAAAAAAADlRva2Vuc1JlY2VpdmVkAAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAACWNsYWltYWJsZQAAAAAAAAEAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACAAAAAAAAAABW5vbmNlAAAAAAAADAAAAAAAAAAJcmVjaXBpZW50AAAAAAAD7gAAACA=",
      "AAAAAQAAAAAAAAAAAAAAClJlY2VpdmVGZWUAAAAAAAMAAAAAAAAAF2JyaWRnZV90cmFuc2FjdGlvbl9jb3N0AAAAAAoAAAAAAAAACWV4dHJhX2dhcwAAAAAAAAoAAAAAAAAAGG1lc3NhZ2VfdHJhbnNhY3Rpb25fY29zdAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAAFUJyaWRnaW5nRmVlRnJvbVRva2VucwAAAAAAAAIAAAAAAAAAEGZlZV90b2tlbl9hbW91bnQAAAAKAAAAAAAAAANnYXMAAAAACg==",
      "AAAAAQAAAAAAAAAAAAAADUFub3RoZXJCcmlkZ2UAAAAAAAACAAAAAAAAAAdhZGRyZXNzAAAAA+4AAAAgAAAAAAAAAAZ0b2tlbnMAAAAAA+wAAAPuAAAAIAAAAAE=",
      "AAAAAQAAAAAAAAAAAAAABkJyaWRnZQAAAAAABgAAAGBwcmVjb21wdXRlZCB2YWx1ZXMgb2YgdGhlIHNjYWxpbmcgZmFjdG9yIHJlcXVpcmVkIGZvciBwYXlpbmcgdGhlIGJyaWRnaW5nIGZlZSB3aXRoIHN0YWJsZSB0b2tlbnMAAAAeYnJpZGdpbmdfZmVlX2NvbnZlcnNpb25fZmFjdG9yAAAAAAPsAAAAEwAAAAoAAAAAAAAACGNhbl9zd2FwAAAAAQAAAGxwcmVjb21wdXRlZCB2YWx1ZXMgdG8gZGl2aWRlIGJ5IHRvIGNoYW5nZSB0aGUgcHJlY2lzaW9uIGZyb20gdGhlIEdhcyBPcmFjbGUgcHJlY2lzaW9uIHRvIHRoZSB0b2tlbiBwcmVjaXNpb24AAAAWZnJvbV9nYXNfb3JhY2xlX2ZhY3RvcgAAAAAD7AAAABMAAAAKAAAAAAAAAAltZXNzZW5nZXIAAAAAAAATAAAAAAAAAAVwb29scwAAAAAAA+wAAAPuAAAAIAAAABMAAAAAAAAACnJlYmFsYW5jZXIAAAAAABM=",
      "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAAC090aGVyQnJpZGdlAAAAAAEAAAAEAAAAAQAAAAAAAAALU2VudE1lc3NhZ2UAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAAPUmVjZWl2ZWRNZXNzYWdlAAAAAAEAAAPuAAAAIA==",
      "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
      "AAAAAQAAAAAAAAAAAAAAEEdhc09yYWNsZUFkZHJlc3MAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAACEdhc1VzYWdlAAAAAQAAAAAAAAABMAAAAAAAA+wAAAAEAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAEAAAAAAAAAATAAAAAAAAAT",
      "AAAAAQAAAAAAAAAAAAAADVN0b3BBdXRob3JpdHkAAAAAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAJQAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
    ]);
  }

  async swapAndBridge({
    sender,
    token,
    amount,
    recipient,
    destination_chain_id,
    receive_token,
    nonce,
    gas_amount,
    fee_token_amount,
  }: {
    sender: Address;
    token: Buffer;
    amount: u128;
    recipient: Buffer;
    destination_chain_id: u32;
    receive_token: Buffer;
    nonce: u256;
    gas_amount: u128;
    fee_token_amount: u128;
  }): Promise<string> {
    return await xdrTxBuilder({
      sender,
      method: "swap_and_bridge",
      args: this.spec.funcArgsToScVals("swap_and_bridge", {
        sender,
        token,
        amount,
        recipient,
        destination_chain_id,
        receive_token,
        nonce,
        gas_amount,
        fee_token_amount,
      }),
      ...this.options,
    });
  }

  async swap({
    sender,
    amount,
    token,
    receive_token,
    recipient,
    receive_amount_min,
    claimable,
  }: {
    sender: Address;
    amount: u128;
    token: Buffer;
    receive_token: Buffer;
    recipient: Address;
    receive_amount_min: u128;
    claimable: boolean;
  }) {
    return await xdrTxBuilder({
      sender,
      method: "swap",
      args: this.spec.funcArgsToScVals("swap", {
        sender,
        amount,
        token,
        receive_token,
        recipient,
        receive_amount_min,
        claimable,
      }),
      ...this.options,
    });
  }
}
