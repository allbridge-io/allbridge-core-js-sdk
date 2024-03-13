/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Address, ContractSpec } from "stellar-sdk";
import type { u128, u32 } from "../../utils/srb/assembled-tx";
import { AssembledTransaction, Err, Ok } from "../../utils/srb/assembled-tx";
import { XDRTransactionBuilder } from "../../utils/srb/build-tx";
import type { ClassOptions, XDR_BASE64 } from "../../utils/srb/method-options";

export * from "../../utils/srb/assembled-tx";
export * from "../../utils/srb/method-options";

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAAIJH55UJZXY7YZ3QQJ5S43KAY4ACEU5EBNS6NLUKJXRQEU2ZC36MUR",
  },
} as const;

/**

 */
export interface Deposit {
  /**

   */
  amount: u128;
  /**

   */
  user: string;
}

/**

 */
export interface Withdraw {
  /**

   */
  amount: u128;
  /**

   */
  user: string;
}

/**

 */
export interface Pool {
  /**

   */
  a: u128;
  /**

   */
  acc_reward_per_share_p: u128;
  /**

   */
  admin_fee_amount: u128;
  /**

   */
  admin_fee_share_bp: u128;
  /**

   */
  balance_ratio_min_bp: u128;
  /**

   */
  can_deposit: boolean;
  /**

   */
  can_withdraw: boolean;
  /**

   */
  d: u128;
  /**

   */
  decimals: u32;
  /**

   */
  fee_share_bp: u128;
  /**

   */
  reserves: u128;
  /**

   */
  token: string;
  /**

   */
  token_balance: u128;
  /**

   */
  total_lp_amount: u128;
  /**

   */
  v_usd_balance: u128;
}

/**

 */
export interface UserDeposit {
  /**

   */
  lp_amount: u128;
  /**

   */
  reward_debt: u128;
}
/**

 */
export const Errors = {
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
      "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",
      "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAASZ2V0X3N0b3BfYXV0aG9yaXR5AAAAAAAAAAAAAQAAA+kAAAATAAAAAw==",
      "AAAAAAAAAAAAAAAKZ2V0X2JyaWRnZQAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
      "AAAAAAAAAAAAAAAQZ2V0X3VzZXJfZGVwb3NpdAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAfQAAAAC1VzZXJEZXBvc2l0AAAAAAM=",
      "AAAAAAAAAAAAAAAVZ2V0X2NsYWltYWJsZV9iYWxhbmNlAAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAoAAAAD",
      "AAAAAQAAAAAAAAAAAAAAD1N3YXBwZWRGcm9tVlVzZAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAAA2ZlZQAAAAAKAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAC3Z1c2RfYW1vdW50AAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAADVN3YXBwZWRUb1ZVc2QAAAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAAA2ZlZQAAAAAKAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAALdnVzZF9hbW91bnQAAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAB0RlcG9zaXQAAAAAAgAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAR1c2VyAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAACFdpdGhkcmF3AAAAAgAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAR1c2VyAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAADlJld2FyZHNDbGFpbWVkAAAAAAACAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAABHVzZXIAAAAT",
      "AAAAAQAAAAAAAAAAAAAADkJhbGFuY2VDbGFpbWVkAAAAAAACAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAABHVzZXIAAAAT",
      "AAAAAQAAAAAAAAAAAAAABkJyaWRnZQAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
      "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAC1VzZXJEZXBvc2l0AAAAAAEAAAATAAAAAQAAAAAAAAAQQ2xhaW1hYmxlQmFsYW5jZQAAAAEAAAAT",
      "AAAAAQAAAAAAAAAAAAAABFBvb2wAAAAPAAAAAAAAAAFhAAAAAAAACgAAAAAAAAAWYWNjX3Jld2FyZF9wZXJfc2hhcmVfcAAAAAAACgAAAAAAAAAQYWRtaW5fZmVlX2Ftb3VudAAAAAoAAAAAAAAAEmFkbWluX2ZlZV9zaGFyZV9icAAAAAAACgAAAAAAAAAUYmFsYW5jZV9yYXRpb19taW5fYnAAAAAKAAAAAAAAAAtjYW5fZGVwb3NpdAAAAAABAAAAAAAAAAxjYW5fd2l0aGRyYXcAAAABAAAAAAAAAAFkAAAAAAAACgAAAAAAAAAIZGVjaW1hbHMAAAAEAAAAAAAAAAxmZWVfc2hhcmVfYnAAAAAKAAAAAAAAAAhyZXNlcnZlcwAAAAoAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAANdG9rZW5fYmFsYW5jZQAAAAAAAAoAAAAAAAAAD3RvdGFsX2xwX2Ftb3VudAAAAAAKAAAAAAAAAA12X3VzZF9iYWxhbmNlAAAAAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAC1VzZXJEZXBvc2l0AAAAAAIAAAAAAAAACWxwX2Ftb3VudAAAAAAAAAoAAAAAAAAAC3Jld2FyZF9kZWJ0AAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAAEENsYWltYWJsZUJhbGFuY2UAAAABAAAAAAAAAAZhbW91bnQAAAAAAAo=",
      "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
      "AAAAAQAAAAAAAAAAAAAAEEdhc09yYWNsZUFkZHJlc3MAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAAAQAAAAAAAAAAAAAACEdhc1VzYWdlAAAAAQAAAAAAAAABMAAAAAAAA+wAAAAEAAAACg==",
      "AAAAAQAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAEAAAAAAAAAATAAAAAAAAAT",
      "AAAAAQAAAAAAAAAAAAAADVN0b3BBdXRob3JpdHkAAAAAAAABAAAAAAAAAAEwAAAAAAAAEw==",
      "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAJQAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
    ]);
  }
  private readonly parsers = {
    deposit: (result: XDR_BASE64 | Err): Ok<void> | Err => {
      if (result instanceof Err) return result;
      return new Ok(this.spec.funcResToNative("deposit", result));
    },
    withdraw: (result: XDR_BASE64 | Err): Ok<void> | Err => {
      if (result instanceof Err) return result;
      return new Ok(this.spec.funcResToNative("withdraw", result));
    },
    claimRewards: (result: XDR_BASE64 | Err): Ok<void> | Err => {
      if (result instanceof Err) return result;
      return new Ok(this.spec.funcResToNative("claim_rewards", result));
    },
    getPool: (result: XDR_BASE64 | Err): Ok<Pool> | Err => {
      if (result instanceof Err) return result;
      return new Ok(this.spec.funcResToNative("get_pool", result));
    },
    getUserDeposit: (result: XDR_BASE64 | Err): Ok<UserDeposit> | Err => {
      if (result instanceof Err) return result;
      return new Ok(this.spec.funcResToNative("get_user_deposit", result));
    },
  };

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  depositXdr = async (
    { sender, amount }: { sender: string; amount: u128 },
    options: {
      /**
       * The fee to pay for the transaction. Default: 100.
       */
      fee?: number;
    } = {}
  ) => {
    return await XDRTransactionBuilder.xdrFromSimulation({
      method: "deposit",
      args: this.spec.funcArgsToScVals("deposit", {
        sender: new Address(sender),
        amount,
      }),
      account: sender,
      ...options,
      ...this.options,
      errorTypes: Errors,
      // @ts-expect-error
      parseResultXdr: this.parsers.deposit,
    });
  };

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdrawXdr = async (
    { sender, amount_lp }: { sender: string; amount_lp: u128 },
    options: {
      /**
       * The fee to pay for the transaction. Default: 100.
       */
      fee?: number;
    } = {}
  ) => {
    return await XDRTransactionBuilder.xdrFromSimulation({
      method: "withdraw",
      args: this.spec.funcArgsToScVals("withdraw", {
        sender: new Address(sender),
        amount_lp,
      }),
      account: sender,
      ...options,
      ...this.options,
      errorTypes: Errors,
      // @ts-expect-error
      parseResultXdr: this.parsers.withdraw,
    });
  };

  /**
   * Construct and simulate a claim_rewards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claimRewardsXdr = async (
    { sender }: { sender: string },
    options: {
      /**
       * The fee to pay for the transaction. Default: 100.
       */
      fee?: number;
    } = {}
  ) => {
    return await XDRTransactionBuilder.xdrFromSimulation({
      method: "claim_rewards",
      args: this.spec.funcArgsToScVals("claim_rewards", {
        sender: new Address(sender),
      }),
      account: sender,
      ...options,
      ...this.options,
      errorTypes: Errors,
      // @ts-expect-error
      parseResultXdr: this.parsers.claimRewards,
    });
  };

  /**
   * Construct and simulate a get_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  getPool = async (
    options: {
      /**
       * The fee to pay for the transaction. Default: 100.
       */
      fee?: number;
    } = {}
  ) => {
    return await AssembledTransaction.fromSimulation({
      method: "get_pool",
      args: this.spec.funcArgsToScVals("get_pool", {}),
      ...options,
      ...this.options,
      errorTypes: Errors,
      // @ts-expect-error
      parseResultXdr: this.parsers.getPool,
    });
  };

  /**
   * Construct and simulate a get_user_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  getUserDeposit = async (
    { user }: { user: string },
    options: {
      /**
       * The fee to pay for the transaction. Default: 100.
       */
      fee?: number;
    } = {}
  ) => {
    return await AssembledTransaction.fromSimulation({
      method: "get_user_deposit",
      args: this.spec.funcArgsToScVals("get_user_deposit", {
        user: new Address(user),
      }),
      ...options,
      ...this.options,
      errorTypes: Errors,
      // @ts-expect-error
      parseResultXdr: this.parsers.getUserDeposit,
    });
  };
}
