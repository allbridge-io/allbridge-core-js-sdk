import { contract } from "@stellar/stellar-sdk";
import u128 = contract.u128;
import u32 = contract.u32;
import u256 = contract.u256;
import AssembledTransaction = contract.AssembledTransaction;
import Result = contract.Result;
import Option = contract.Option;
import ContractSpec = contract.Spec;
import ContractClient = contract.Client;
import ContractClientOptions = contract.ClientOptions;

export interface Swapped {
  receive_amount: u128;
  receive_token: Buffer;
  recipient: string;
  send_amount: u128;
  send_token: Buffer;
  sender: string;
}

export interface TokensSent {
  amount: u128;
  destination_chain_id: u32;
  nonce: u256;
  receive_token: Buffer;
  recipient: Buffer;
}

export interface TokensReceived {
  amount: u128;
  message: Buffer;
  nonce: u256;
  recipient: Buffer;
}

export interface ReceiveFee {
  bridge_transaction_cost: u128;
  extra_gas: u128;
  message_transaction_cost: u128;
}

export interface BridgingFeeFromTokens {
  fee_token_amount: u128;
  gas: u128;
}

export interface AnotherBridge {
  address: Buffer;
  tokens: Map<Buffer, boolean>;
}

export interface Bridge {
  /**
   * precomputed values of the scaling factor required for paying the bridging fee with stable tokens
   */
  bridging_fee_conversion_factor: Map<string, u128>;
  can_swap: boolean;
  /**
   * precomputed values to divide by to change the precision from the Gas Oracle precision to the token precision
   */
  from_gas_oracle_factor: Map<string, u128>;
  messenger: string;
  pools: Map<Buffer, string>;
  rebalancer: string;
}

export type DataKey =
  | { tag: "OtherBridge"; values: readonly [u32] }
  | { tag: "SentMessage"; values: readonly [Buffer] }
  | { tag: "ReceivedMessage"; values: readonly [Buffer] };

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
export interface BridgeContract {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      admin,
      messenger,
      gas_oracle,
      native_token,
    }: {
      admin: string;
      messenger: string;
      gas_oracle: string;
      native_token: string;
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
   * Construct and simulate a swap_and_bridge transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  swap_and_bridge: (
    {
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
      sender: string;
      token: string;
      amount: u128;
      recipient: Buffer;
      destination_chain_id: u32;
      receive_token: Buffer;
      nonce: u256;
      gas_amount: u128;
      fee_token_amount: u128;
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
   * Construct and simulate a receive_tokens transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  receive_tokens: (
    {
      sender,
      amount,
      recipient,
      source_chain_id,
      receive_token,
      nonce,
      receive_amount_min,
      extra_gas,
    }: {
      sender: string;
      amount: u128;
      recipient: string;
      source_chain_id: u32;
      receive_token: Buffer;
      nonce: u256;
      receive_amount_min: u128;
      extra_gas: Option<u128>;
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
   * Construct and simulate a swap transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  swap: (
    {
      sender,
      amount,
      token,
      receive_token,
      recipient,
      receive_amount_min,
    }: {
      sender: string;
      amount: u128;
      token: Buffer;
      receive_token: Buffer;
      recipient: string;
      receive_amount_min: u128;
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
   * Construct and simulate a stop_swap transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  stop_swap: (options?: {
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
   * Construct and simulate a start_swap transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_swap: (options?: {
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
   * Construct and simulate a set_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_gas_oracle: (
    { new_address }: { new_address: string },
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
   * Construct and simulate a set_stop_authority transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
   * Construct and simulate a set_rebalancer transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_rebalancer: (
    { rebalancer }: { rebalancer: string },
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
   * Construct and simulate a set_messenger transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_messenger: (
    { messenger }: { messenger: string },
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
   * Construct and simulate a set_gas_usage transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_gas_usage: (
    { chain_id, gas_usage }: { chain_id: u32; gas_usage: u128 },
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
   * Construct and simulate a register_bridge transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_bridge: (
    { chain_id, bridge_address }: { chain_id: u32; bridge_address: Buffer },
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
   * Construct and simulate a add_bridge_token transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_bridge_token: (
    { chain_id, token_address }: { chain_id: u32; token_address: Buffer },
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
   * Construct and simulate a remove_bridge_token transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_bridge_token: (
    { chain_id, token_address }: { chain_id: u32; token_address: Buffer },
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
   * Construct and simulate a add_pool transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_pool: (
    { pool, token }: { pool: string; token: string },
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
   * Construct and simulate a withdraw_gas_tokens transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw_gas_tokens: (
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
   * Construct and simulate a withdraw_bridging_fee_in_tokens transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw_bridging_fee_in_tokens: (
    { sender, token_address }: { sender: string; token_address: string },
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
   * Construct and simulate a has_processed_message transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_processed_message: (
    { message }: { message: Buffer },
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
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a has_received_message transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_received_message: (
    { message }: { message: Buffer },
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
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a get_pool_address transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool_address: (
    { token_address }: { token_address: Buffer },
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
  ) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_config: (options?: {
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
  }) => Promise<AssembledTransaction<Result<Bridge>>>;

  /**
   * Construct and simulate a get_stop_authority transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
   * Construct and simulate a get_transaction_cost transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_transaction_cost: (
    { chain_id }: { chain_id: u32 },
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
   * Construct and simulate a get_gas_usage transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_gas_usage: (
    { chain_id }: { chain_id: u32 },
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
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
   * Construct and simulate a get_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_gas_oracle: (options?: {
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
   * Construct and simulate a get_another_bridge transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_another_bridge: (
    { chain_id }: { chain_id: u32 },
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
  ) => Promise<AssembledTransaction<Result<AnotherBridge>>>;

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `Result` field containing the Result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
export class BridgeContract extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAltZXNzZW5nZXIAAAAAAAATAAAAAAAAAApnYXNfb3JhY2xlAAAAAAATAAAAAAAAAAxuYXRpdmVfdG9rZW4AAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAPc3dhcF9hbmRfYnJpZGdlAAAAAAkAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAACXJlY2lwaWVudAAAAAAAA+4AAAAgAAAAAAAAABRkZXN0aW5hdGlvbl9jaGFpbl9pZAAAAAQAAAAAAAAADXJlY2VpdmVfdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAFbm9uY2UAAAAAAAAMAAAAAAAAAApnYXNfYW1vdW50AAAAAAAKAAAAAAAAABBmZWVfdG9rZW5fYW1vdW50AAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAOcmVjZWl2ZV90b2tlbnMAAAAAAAgAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAA9zb3VyY2VfY2hhaW5faWQAAAAABAAAAAAAAAANcmVjZWl2ZV90b2tlbgAAAAAAA+4AAAAgAAAAAAAAAAVub25jZQAAAAAAAAwAAAAAAAAAEnJlY2VpdmVfYW1vdW50X21pbgAAAAAACgAAAAAAAAAJZXh0cmFfZ2FzAAAAAAAD6AAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAEc3dhcAAAAAYAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAAAAAAV0b2tlbgAAAAAAA+4AAAAgAAAAAAAAAA1yZWNlaXZlX3Rva2VuAAAAAAAD7gAAACAAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAAEnJlY2VpdmVfYW1vdW50X21pbgAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
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
        "AAAAAAAAAAAAAAAIYWRkX3Bvb2wAAAACAAAAAAAAAARwb29sAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
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
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAB1N3YXBwZWQAAAAABgAAAAAAAAAOcmVjZWl2ZV9hbW91bnQAAAAAAAoAAAAAAAAADXJlY2VpdmVfdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAALc2VuZF9hbW91bnQAAAAACgAAAAAAAAAKc2VuZF90b2tlbgAAAAAD7gAAACAAAAAAAAAABnNlbmRlcgAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAClRva2Vuc1NlbnQAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAUZGVzdGluYXRpb25fY2hhaW5faWQAAAAEAAAAAAAAAAVub25jZQAAAAAAAAwAAAAAAAAADXJlY2VpdmVfdG9rZW4AAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAD7gAAACA=",
        "AAAAAQAAAAAAAAAAAAAADlRva2Vuc1JlY2VpdmVkAAAAAAAEAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACAAAAAAAAAABW5vbmNlAAAAAAAADAAAAAAAAAAJcmVjaXBpZW50AAAAAAAD7gAAACA=",
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
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAKAAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAYVG9rZW5JbnN1ZmZpY2llbnRCYWxhbmNlAAAACgAAAAAAAAAKQ2FzdEZhaWxlZAAAAAAACwAAAAAAAAAMVTI1Nk92ZXJmbG93AAAADAAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
      ]),
      options
    );
  }

  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    swap_and_bridge: this.txFromJSON<Result<void>>,
    receive_tokens: this.txFromJSON<Result<void>>,
    swap: this.txFromJSON<Result<void>>,
    stop_swap: this.txFromJSON<Result<void>>,
    start_swap: this.txFromJSON<Result<void>>,
    set_gas_oracle: this.txFromJSON<Result<void>>,
    set_stop_authority: this.txFromJSON<Result<void>>,
    set_rebalancer: this.txFromJSON<Result<void>>,
    set_messenger: this.txFromJSON<Result<void>>,
    set_gas_usage: this.txFromJSON<Result<void>>,
    register_bridge: this.txFromJSON<Result<void>>,
    add_bridge_token: this.txFromJSON<Result<void>>,
    remove_bridge_token: this.txFromJSON<Result<void>>,
    add_pool: this.txFromJSON<Result<void>>,
    withdraw_gas_tokens: this.txFromJSON<Result<void>>,
    withdraw_bridging_fee_in_tokens: this.txFromJSON<Result<void>>,
    has_processed_message: this.txFromJSON<Result<boolean>>,
    has_received_message: this.txFromJSON<Result<boolean>>,
    get_pool_address: this.txFromJSON<Result<string>>,
    get_config: this.txFromJSON<Result<Bridge>>,
    get_stop_authority: this.txFromJSON<Result<string>>,
    get_transaction_cost: this.txFromJSON<Result<u128>>,
    get_gas_usage: this.txFromJSON<Result<u128>>,
    get_admin: this.txFromJSON<Result<string>>,
    get_gas_oracle: this.txFromJSON<Result<string>>,
    get_another_bridge: this.txFromJSON<Result<AnotherBridge>>,
    set_admin: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
  };
}
