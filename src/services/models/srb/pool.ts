import { Address, ContractSpec } from "soroban-client";
import { SdkError } from "../../../exceptions";
import { invoke } from "../../utils/srb/invoke";
import { xdrTxBuilder } from "../../utils/srb/tx-builder";
import type { ClassOptions } from "./method-options";

export * from "../../utils/srb/invoke";
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

const regex = /Error\(Contract, #(\d+)\)/;

function parseError(message: string): Err | undefined {
  const match = message.match(regex);
  if (!match) {
    return undefined;
  }
  const i = parseInt(match[1], 10);
  // @ts-expect-error //TODO
  const err = Errors[i];
  if (err) {
    return new Err(err);
  }
  return undefined;
}

export const networks = {
  futurenet: {
    networkPassphrase: "Test SDF Future Network ; October 2022",
    contractId: "CCUFKM6WZKBPAFSY7EHTB4FKMMTQPK7YH7U3VV7MRBPO3FAO6P5A2CZV",
  },
} as const;

export interface SwappedFromVUsd {
  amount: u128;
  fee: u128;
  recipient: Address;
  token: Address;
  vusd_amount: u128;
}

export interface SwappedToVUsd {
  amount: u128;
  fee: u128;
  sender: Address;
  token: Address;
  vusd_amount: u128;
}

export interface Deposit {
  amount: u128;
  user: Address;
}

export interface Withdraw {
  amount: u128;
  user: Address;
}

export interface RewardsClaimed {
  amount: u128;
  user: Address;
}

export type Bridge = readonly [Address];

export interface DataKey {
  tag: "UserDeposit";
  values: readonly [Address];
}

export interface Pool {
  a: u128;
  acc_reward_per_share_p: u128;
  admin_fee_amount: u128;
  admin_fee_share_bp: u128;
  balance_ratio_min_bp: u128;
  can_deposit: boolean;
  can_withdraw: boolean;
  d: u128;
  decimals: u32;
  fee_share_bp: u128;
  reserves: u128;
  token: Address;
  token_balance: u128;
  total_lp_amount: u128;
  v_usd_balance: u128;
}

export interface UserDeposit {
  lp_amount: u128;
  reward_debt: u128;
}

export type Admin = readonly [Address];
export type GasOracleAddress = readonly [Address];
export type GasUsage = readonly [Map<u32, u128>];
export type NativeToken = readonly [Address];
export type StopAuthority = readonly [Address];
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

export class PoolContract {
  spec: ContractSpec;

  constructor(public readonly options: ClassOptions) {
    this.spec = new ContractSpec([
      "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZicmlkZ2UAAAAAABMAAAAAAAAAAWEAAAAAAAAKAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAADGZlZV9zaGFyZV9icAAAAAoAAAAAAAAAFGJhbGFuY2VfcmF0aW9fbWluX2JwAAAACgAAAAAAAAASYWRtaW5fZmVlX3NoYXJlX2JwAAAAAAAKAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAACWFtb3VudF9scAAAAAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAANc3dhcF90b192X3VzZAAAAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAACHplcm9fZmVlAAAAAQAAAAEAAAPpAAAACgAAAAM=",
      "AAAAAAAAAAAAAAAPc3dhcF9mcm9tX3ZfdXNkAAAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAt2dXNkX2Ftb3VudAAAAAAKAAAAAAAAABJyZWNlaXZlX2Ftb3VudF9taW4AAAAAAAoAAAAAAAAACHplcm9fZmVlAAAAAQAAAAEAAAPpAAAACgAAAAM=",
      "AAAAAAAAAAAAAAANY2xhaW1fcmV3YXJkcwAAAAAAAAEAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAdgYWRtaW5gAAAAAA1zZXRfZmVlX3NoYXJlAAAAAAAAAQAAAAAAAAAMZmVlX3NoYXJlX2JwAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAWYWRqdXN0X3RvdGFsX2xwX2Ftb3VudAAAAAAAAAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAYc2V0X2JhbGFuY2VfcmF0aW9fbWluX2JwAAAAAQAAAAAAAAAUYmFsYW5jZV9yYXRpb19taW5fYnAAAAAKAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAMc3RvcF9kZXBvc2l0AAAAAAAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAANc3RhcnRfZGVwb3NpdAAAAAAAAAAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAANc3RvcF93aXRoZHJhdwAAAAAAAAAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAAOc3RhcnRfd2l0aGRyYXcAAAAAAAAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAASc2V0X3N0b3BfYXV0aG9yaXR5AAAAAAABAAAAAAAAAA5zdG9wX2F1dGhvcml0eQAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAAKc2V0X2JyaWRnZQAAAAAAAQAAAAAAAAAGYnJpZGdlAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
      "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
      "AAAAAAAAAAAAAAATc2V0X2FkbWluX2ZlZV9zaGFyZQAAAAABAAAAAAAAABJhZG1pbl9mZWVfc2hhcmVfYnAAAAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAAAAAAPY2xhaW1fYWRtaW5fZmVlAAAAAAAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
      "AAAAAAAAAAZgdmlld2AAAAAAAA5wZW5kaW5nX3Jld2FyZAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAoAAAAD",
      "AAAAAAAAAAAAAAAIZ2V0X3Bvb2wAAAAAAAAAAQAAA+kAAAfQAAAABFBvb2wAAAAD",
      "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAASZ2V0X3N0b3BfYXV0aG9yaXR5AAAAAAAAAAAAAQAAA+kAAAATAAAAAw==",
      "AAAAAAAAAAAAAAAKZ2V0X2JyaWRnZQAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAAQZ2V0X3VzZXJfZGVwb3NpdAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAfQAAAAC1VzZXJEZXBvc2l0AAAAAAM=",
      "AAAAAQAAAAAAAAAAAAAAD1N3YXBwZWRGcm9tVlVzZAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAAA2ZlZQAAAAAKAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAC3Z1c2RfYW1vdW50AAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAADVN3YXBwZWRUb1ZVc2QAAAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAAA2ZlZQAAAAAKAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAALdnVzZF9hbW91bnQAAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAB0RlcG9zaXQAAAAAAgAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAR1c2VyAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAACFdpdGhkcmF3AAAAAgAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAR1c2VyAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAADlJld2FyZHNDbGFpbWVkAAAAAAACAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAABHVzZXIAAAAT",
      "AAAAAQAAAAAAAAAAAAAABkJyaWRnZQAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
      "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAEAAAAAAAAAC1VzZXJEZXBvc2l0AAAAAAEAAAAT",
      "AAAAAQAAAAAAAAAAAAAABFBvb2wAAAAPAAAAAAAAAAFhAAAAAAAACgAAAAAAAAAWYWNjX3Jld2FyZF9wZXJfc2hhcmVfcAAAAAAACgAAAAAAAAAQYWRtaW5fZmVlX2Ftb3VudAAAAAoAAAAAAAAAEmFkbWluX2ZlZV9zaGFyZV9icAAAAAAACgAAAAAAAAAUYmFsYW5jZV9yYXRpb19taW5fYnAAAAAKAAAAAAAAAAtjYW5fZGVwb3NpdAAAAAABAAAAAAAAAAxjYW5fd2l0aGRyYXcAAAABAAAAAAAAAAFkAAAAAAAACgAAAAAAAAAIZGVjaW1hbHMAAAAEAAAAAAAAAAxmZWVfc2hhcmVfYnAAAAAKAAAAAAAAAAhyZXNlcnZlcwAAAAoAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAANdG9rZW5fYmFsYW5jZQAAAAAAAAoAAAAAAAAAD3RvdGFsX2xwX2Ftb3VudAAAAAAKAAAAAAAAAA12X3VzZF9iYWxhbmNlAAAAAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAC1VzZXJEZXBvc2l0AAAAAAIAAAAAAAAACWxwX2Ftb3VudAAAAAAAAAoAAAAAAAAAC3Jld2FyZF9kZWJ0AAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
      "AAAAAQAAAAAAAAAAAAAAEEdhc09yYWNsZUFkZHJlc3MAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAACEdhc1VzYWdlAAAAAQAAAAAAAAABMAAAAAAAA+wAAAAEAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAEAAAAAAAAAATAAAAAAAAAT",
      "AAAAAQAAAAAAAAAAAAAADVN0b3BBdXRob3JpdHkAAAAAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAJQAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
    ]);
  }

  async deposit({ sender, amount }: { sender: Address; amount: u128 }): Promise<string> {
    return await xdrTxBuilder({
      sender,
      method: "deposit",
      args: this.spec.funcArgsToScVals("deposit", { sender, amount }),
      ...this.options,
    });
  }

  async withdraw({ sender, amount_lp }: { sender: Address; amount_lp: u128 }): Promise<string> {
    return await xdrTxBuilder({
      sender,
      method: "withdraw",
      args: this.spec.funcArgsToScVals("withdraw", { sender, amount_lp }),
      ...this.options,
    });
  }

  async claimRewards({ sender }: { sender: Address }): Promise<string> {
    return await xdrTxBuilder({
      sender,
      method: "claim_rewards",
      args: this.spec.funcArgsToScVals("claim_rewards", { sender }),
      ...this.options,
    });
  }

  async getPool() {
    try {
      return await invoke({
        method: "get_pool",
        args: this.spec.funcArgsToScVals("get_pool", {}),
        ...this.options,
        parseResultXdr: (xdr): Ok<Pool> | Err | undefined => {
          return new Ok(this.spec.funcResToNative("get_pool", xdr));
        },
      });
    } catch (e) {
      if (typeof e === "string") {
        const err = parseError(e);
        if (err) return err;
      }
      throw e;
    }
  }

  async getUserDeposit({ user }: { user: Address }) {
    try {
      return await invoke({
        method: "get_user_deposit",
        args: this.spec.funcArgsToScVals("get_user_deposit", { user }),
        ...this.options,
        parseResultXdr: (xdr): Ok<UserDeposit> | Err | undefined => {
          return new Ok(this.spec.funcResToNative("get_user_deposit", xdr));
        },
      });
    } catch (e) {
      if (typeof e === "string") {
        const err = parseError(e);
        if (err) return err;
      }
      throw e;
    }
  }
}
