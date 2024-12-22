import { contract } from "@stellar/stellar-sdk";
import u128 = contract.u128;
import u32 = contract.u32;
import AssembledTransaction = contract.AssembledTransaction;
import Result = contract.Result;
import ContractSpec = contract.Spec;
import ContractClient = contract.Client;
import ContractClientOptions = contract.ClientOptions;

export interface MessageSent {
  message: Buffer;
}

export interface MessageReceived {
  message: Buffer;
}

export interface SecondaryValidatorsSet {
  new_validators: string[];
  old_validators: string[];
}

export interface Config {
  chain_id: u32;
  other_chain_ids: Buffer;
  primary_validator_key: Buffer;
  secondary_validator_keys: Map<Buffer, boolean>;
}

export type DataKey =
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
export interface MessengerContract {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      admin,
      chain_id,
      native_token_address,
      other_chain_ids,
      gas_oracle_address,
      primary_validator_key,
      secondary_validator_keys,
    }: {
      admin: string;
      chain_id: u32;
      native_token_address: string;
      other_chain_ids: Buffer;
      gas_oracle_address: string;
      primary_validator_key: Buffer;
      secondary_validator_keys: Map<Buffer, boolean>;
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a send_message transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  send_message: (
    { message, sender }: { message: Buffer; sender: string },
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a receive_message transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  receive_message: (
    {
      message,
      primary_signature,
      primary_recovery_id,
      secondary_signature,
      secondary_recovery_id,
    }: {
      message: Buffer;
      primary_signature: Buffer;
      primary_recovery_id: u32;
      secondary_signature: Buffer;
      secondary_recovery_id: u32;
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_gas_usage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a add_secondary_validator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_secondary_validator: (
    { validator_address }: { validator_address: Buffer },
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a remove_secondary_validator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_secondary_validator: (
    { validator_address }: { validator_address: Buffer },
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_primary_validator transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_primary_validator: (
    { validator_address }: { validator_address: Buffer },
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
    },
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_other_chain_ids transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_other_chain_ids: (
    { other_chain_ids }: { other_chain_ids: Buffer },
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a withdraw_gas_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
  }) => Promise<AssembledTransaction<Result<Config>>>;

  /**
   * Construct and simulate a has_sent_message transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_sent_message: (
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
    },
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a has_received_message transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a get_sent_message_sequence transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_sent_message_sequence: (
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
    },
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a get_gas_usage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a get_transaction_cost transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<u128>>>;

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
   * Construct and simulate a get_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
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
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class MessengerContract extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAAAAAAAFG5hdGl2ZV90b2tlbl9hZGRyZXNzAAAAEwAAAAAAAAAPb3RoZXJfY2hhaW5faWRzAAAAA+4AAAAgAAAAAAAAABJnYXNfb3JhY2xlX2FkZHJlc3MAAAAAABMAAAAAAAAAFXByaW1hcnlfdmFsaWRhdG9yX2tleQAAAAAAA+4AAABBAAAAAAAAABhzZWNvbmRhcnlfdmFsaWRhdG9yX2tleXMAAAPsAAAD7gAAAEEAAAABAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAMc2VuZF9tZXNzYWdlAAAAAgAAAAAAAAAHbWVzc2FnZQAAAAPuAAAAIAAAAAAAAAAGc2VuZGVyAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAPcmVjZWl2ZV9tZXNzYWdlAAAAAAUAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACAAAAAAAAAAEXByaW1hcnlfc2lnbmF0dXJlAAAAAAAD7gAAAEAAAAAAAAAAE3ByaW1hcnlfcmVjb3ZlcnlfaWQAAAAABAAAAAAAAAATc2Vjb25kYXJ5X3NpZ25hdHVyZQAAAAPuAAAAQAAAAAAAAAAVc2Vjb25kYXJ5X3JlY292ZXJ5X2lkAAAAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAANc2V0X2dhc191c2FnZQAAAAAAAAIAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAAJZ2FzX3VzYWdlAAAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAXYWRkX3NlY29uZGFyeV92YWxpZGF0b3IAAAAAAQAAAAAAAAARdmFsaWRhdG9yX2FkZHJlc3MAAAAAAAPuAAAAQQAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAacmVtb3ZlX3NlY29uZGFyeV92YWxpZGF0b3IAAAAAAAEAAAAAAAAAEXZhbGlkYXRvcl9hZGRyZXNzAAAAAAAD7gAAAEEAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAVc2V0X3ByaW1hcnlfdmFsaWRhdG9yAAAAAAAAAQAAAAAAAAARdmFsaWRhdG9yX2FkZHJlc3MAAAAAAAPuAAAAQQAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAOc2V0X2dhc19vcmFjbGUAAAAAAAEAAAAAAAAAC25ld19hZGRyZXNzAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAATc2V0X290aGVyX2NoYWluX2lkcwAAAAABAAAAAAAAAA9vdGhlcl9jaGFpbl9pZHMAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAAAAAAATd2l0aGRyYXdfZ2FzX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAPpAAAH0AAAAAZDb25maWcAAAAAAAM=",
        "AAAAAAAAAAAAAAAQaGFzX3NlbnRfbWVzc2FnZQAAAAEAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACAAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAAAAAAAUaGFzX3JlY2VpdmVkX21lc3NhZ2UAAAABAAAAAAAAAAdtZXNzYWdlAAAAA+4AAAAgAAAAAQAAA+kAAAABAAAAAw==",
        "AAAAAAAAAAAAAAAZZ2V0X3NlbnRfbWVzc2FnZV9zZXF1ZW5jZQAAAAAAAAEAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACAAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAAAAAAANZ2V0X2dhc191c2FnZQAAAAAAAAEAAAAAAAAACGNoYWluX2lkAAAABAAAAAEAAAPpAAAACgAAAAM=",
        "AAAAAAAAAAAAAAAUZ2V0X3RyYW5zYWN0aW9uX2Nvc3QAAAABAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAABAAAD6QAAAAoAAAAD",
        "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
        "AAAAAAAAAAAAAAAOZ2V0X2dhc19vcmFjbGUAAAAAAAAAAAABAAAD6QAAABMAAAAD",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAC01lc3NhZ2VTZW50AAAAAAEAAAAAAAAAB21lc3NhZ2UAAAAD7gAAACA=",
        "AAAAAQAAAAAAAAAAAAAAD01lc3NhZ2VSZWNlaXZlZAAAAAABAAAAAAAAAAdtZXNzYWdlAAAAA+4AAAAg",
        "AAAAAQAAAAAAAAAAAAAAFlNlY29uZGFyeVZhbGlkYXRvcnNTZXQAAAAAAAIAAAAAAAAADm5ld192YWxpZGF0b3JzAAAAAAPqAAAAEwAAAAAAAAAOb2xkX3ZhbGlkYXRvcnMAAAAAA+oAAAAT",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAABAAAAAAAAAAIY2hhaW5faWQAAAAEAAAAAAAAAA9vdGhlcl9jaGFpbl9pZHMAAAAD7gAAACAAAAAAAAAAFXByaW1hcnlfdmFsaWRhdG9yX2tleQAAAAAAA+4AAABBAAAAAAAAABhzZWNvbmRhcnlfdmFsaWRhdG9yX2tleXMAAAPsAAAD7gAAAEEAAAAB",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAC1NlbnRNZXNzYWdlAAAAAAEAAAPuAAAAIAAAAAEAAAAAAAAAD1JlY2VpdmVkTWVzc2FnZQAAAAABAAAD7gAAACA=",
        "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
        "AAAAAQAAAAAAAAAAAAAAEEdhc09yYWNsZUFkZHJlc3MAAAABAAAAAAAAAAEwAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAACEdhc1VzYWdlAAAAAQAAAAAAAAABMAAAAAAAA+wAAAAEAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAEAAAAAAAAAATAAAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAADVN0b3BBdXRob3JpdHkAAAAAAAABAAAAAAAAAAEwAAAAAAAAEw==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAKAAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAYVG9rZW5JbnN1ZmZpY2llbnRCYWxhbmNlAAAACgAAAAAAAAAKQ2FzdEZhaWxlZAAAAAAACwAAAAAAAAAMVTI1Nk92ZXJmbG93AAAADAAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    send_message: this.txFromJSON<Result<void>>,
    receive_message: this.txFromJSON<Result<void>>,
    set_gas_usage: this.txFromJSON<Result<void>>,
    add_secondary_validator: this.txFromJSON<Result<void>>,
    remove_secondary_validator: this.txFromJSON<Result<void>>,
    set_primary_validator: this.txFromJSON<Result<void>>,
    set_admin: this.txFromJSON<Result<void>>,
    set_gas_oracle: this.txFromJSON<Result<void>>,
    set_other_chain_ids: this.txFromJSON<Result<void>>,
    withdraw_gas_tokens: this.txFromJSON<Result<void>>,
    get_config: this.txFromJSON<Result<Config>>,
    has_sent_message: this.txFromJSON<Result<boolean>>,
    has_received_message: this.txFromJSON<Result<boolean>>,
    get_sent_message_sequence: this.txFromJSON<Result<u32>>,
    get_gas_usage: this.txFromJSON<Result<u128>>,
    get_transaction_cost: this.txFromJSON<Result<u128>>,
    get_admin: this.txFromJSON<Result<string>>,
    get_gas_oracle: this.txFromJSON<Result<string>>,
    upgrade: this.txFromJSON<Result<void>>,
  };
}
