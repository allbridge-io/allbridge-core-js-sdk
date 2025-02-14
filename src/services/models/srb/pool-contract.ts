import { contract } from "@stellar/stellar-sdk";
import u128 = contract.u128;
import u32 = contract.u32;
import AssembledTransaction = contract.AssembledTransaction;
import Result = contract.Result;
import ContractSpec = contract.Spec;
import ContractClient = contract.Client;
import ContractClientOptions = contract.ClientOptions;

export interface SwappedFromVUsd {
  amount: u128;
  fee: u128;
  recipient: string;
  token: string;
  vusd_amount: u128;
}

export interface SwappedToVUsd {
  amount: u128;
  fee: u128;
  sender: string;
  token: string;
  vusd_amount: u128;
}

export interface Deposit {
  amount: u128;
  user: string;
}

export interface Withdraw {
  amount: u128;
  user: string;
}

export interface RewardsClaimed {
  amount: u128;
  user: string;
}

export type Bridge = readonly [string];
export interface DataKey {
  tag: "UserDeposit";
  values: readonly [string];
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
  token: string;
  token_balance: u128;
  total_lp_amount: u128;
  v_usd_balance: u128;
}

export interface UserDeposit {
  lp_amount: u128;
  reward_debt: u128;
}

export type Admin = readonly [string];
export type GasOracleAddress = readonly [string];
export type GasUsage = readonly [Map<u32, u128>];
export type NativeToken = readonly [string];
export type StopAuthority = readonly [string];
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
  10: { message: "" },
  11: { message: "" },
  12: { message: "" },
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface PoolContract {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      admin,
      bridge,
      a,
      token,
      fee_share_bp,
      balance_ratio_min_bp,
      admin_fee_share_bp,
    }: {
      admin: string;
      bridge: string;
      a: u128;
      token: string;
      fee_share_bp: u128;
      balance_ratio_min_bp: u128;
      admin_fee_share_bp: u128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: (
    { sender, amount }: { sender: string; amount: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: (
    { sender, amount_lp }: { sender: string; amount_lp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a swap_to_v_usd transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  swap_to_v_usd: (
    { user, amount, zero_fee }: { user: string; amount: u128; zero_fee: boolean },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a swap_from_v_usd transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  swap_from_v_usd: (
    {
      user,
      vusd_amount,
      receive_amount_min,
      zero_fee,
    }: {
      user: string;
      vusd_amount: u128;
      receive_amount_min: u128;
      zero_fee: boolean;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a claim_rewards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_rewards: (
    { sender }: { sender: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.   *
   * `admin`
   */
  set_fee_share: (
    { fee_share_bp }: { fee_share_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a adjust_total_lp_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  adjust_total_lp_amount: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_balance_ratio_min_bp transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_balance_ratio_min_bp: (
    { balance_ratio_min_bp }: { balance_ratio_min_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a stop_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  stop_deposit: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a start_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_deposit: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a stop_withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  stop_withdraw: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a start_withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_withdraw: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_stop_authority transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_stop_authority: (
    { stop_authority }: { stop_authority: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_bridge: (
    { bridge }: { bridge: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: (
    { new_admin }: { new_admin: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_admin_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin_fee_share: (
    { admin_fee_share_bp }: { admin_fee_share_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a claim_admin_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_admin_fee: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a pending_reward transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.   *
   * `view`
   */
  pending_reward: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a get_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Pool>>>;

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a get_stop_authority transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_stop_authority: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a get_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bridge: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a get_user_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_deposit: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<UserDeposit>>>;

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: (
    { new_wasm_hash }: { new_wasm_hash: Buffer },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PoolContract extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
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
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
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
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAKAAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAYVG9rZW5JbnN1ZmZpY2llbnRCYWxhbmNlAAAACgAAAAAAAAAKQ2FzdEZhaWxlZAAAAAAACwAAAAAAAAAMVTI1Nk92ZXJmbG93AAAADAAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
      ]),
      options
    );
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    deposit: this.txFromJSON<Result<void>>,
    withdraw: this.txFromJSON<Result<void>>,
    swap_to_v_usd: this.txFromJSON<Result<u128>>,
    swap_from_v_usd: this.txFromJSON<Result<u128>>,
    claim_rewards: this.txFromJSON<Result<void>>,
    set_fee_share: this.txFromJSON<Result<void>>,
    adjust_total_lp_amount: this.txFromJSON<Result<void>>,
    set_balance_ratio_min_bp: this.txFromJSON<Result<void>>,
    stop_deposit: this.txFromJSON<Result<void>>,
    start_deposit: this.txFromJSON<Result<void>>,
    stop_withdraw: this.txFromJSON<Result<void>>,
    start_withdraw: this.txFromJSON<Result<void>>,
    set_stop_authority: this.txFromJSON<Result<void>>,
    set_bridge: this.txFromJSON<Result<void>>,
    set_admin: this.txFromJSON<Result<void>>,
    set_admin_fee_share: this.txFromJSON<Result<void>>,
    claim_admin_fee: this.txFromJSON<Result<void>>,
    pending_reward: this.txFromJSON<Result<u128>>,
    get_pool: this.txFromJSON<Result<Pool>>,
    get_admin: this.txFromJSON<Result<string>>,
    get_stop_authority: this.txFromJSON<Result<string>>,
    get_bridge: this.txFromJSON<Result<string>>,
    get_user_deposit: this.txFromJSON<Result<UserDeposit>>,
    upgrade: this.txFromJSON<Result<void>>,
  };
}
