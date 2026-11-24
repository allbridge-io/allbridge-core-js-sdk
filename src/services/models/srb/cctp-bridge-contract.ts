import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

declare const window: { Buffer?: typeof Buffer } | undefined;

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAU3ADA6ILBLFOJMHZX5OTPFGWNI37IWF233CECFW5M2TUQZAO4DNCFQ",
  }
} as const


export interface ReceiveFee {
  bridge_transaction_cost: u128;
  extra_gas: u128;
  message_transaction_cost: u128;
}


export interface TokensSent {
  admin_fee: u128;
  amount: u128;
  destination_chain_id: u32;
  recipient: Buffer;
  sender: string;
}


export interface TokensReceived {
  amount: i128;
  extra_gas_value: u128;
  message_id: Buffer;
  recipient: string;
  recipient_muxed_id: Option<u64>;
}


export interface AdminTransferred {
  new_admin: string;
  previous_admin: string;
}


export interface AdminTransferStarted {
  admin: string;
  pending_admin: string;
}


export interface BridgingFeeFromTokens {
  fee_token_amount: u128;
  gas: u128;
}


export interface AdminTransferCancelled {
  admin: string;
  pending_admin: string;
}


export interface ChainBridge {
  chain_id: u32;
  domain: u32;
  gas_usage: u128;
  other_bridge: Buffer;
}


export interface Config {
  admin: string;
  admin_fee_share_bp: u64;
  bridging_fee_conversion_factor: u128;
  gas_oracle: string;
  max_fee_share: i128;
  message_transmitter: string;
  min_finality_threshold: u32;
  native_token: string;
  outbound_nonce: u128;
  token_messenger_minter: string;
  usdc_token: string;
}

export type DataKey = {tag: "Config", values: void} | {tag: "ChainBridge", values: readonly [u32]} | {tag: "Domain", values: readonly [u32]} | {tag: "PendingAdmin", values: void};

export type Admin = readonly [string];

export const Errors = {
  1: {message:"Initialized"},
  2: {message:"Uninitialized"},
  4: {message:"InvalidArg"},
  5: {message:"InvalidChainId"},
  7: {message:"GasUsageNotSet"},
  12: {message:"U256Overflow"},
  205: {message:"AmountTooLowForFee"},
  209: {message:"WrongDestinationChain"},
  210: {message:"UnknownAnotherChain"},
  214: {message:"NotEnoughFee"},
  215: {message:"NoMessage"},
  216: {message:"NoPendingAdmin"},
  400: {message:"NoGasDataForChain"}
}

export interface Client {
  /**
   * Construct and simulate a admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  admin: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bridge: ({sender, amount, recipient, destination_chain_id, gas_amount, fee_token_amount}: {sender: string, amount: u128, recipient: Buffer, destination_chain_id: u32, gas_amount: u128, fee_token_amount: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Nominates the new admin. It becomes the admin only after it calls `accept_admin`.
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  gas_oracle: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a usdc_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  usdc_token: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a accept_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Completes the admin handover. Must be authorized by the admin nominated with `set_admin`.
   */
  accept_admin: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a native_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  native_token: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a max_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  max_fee_share: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a pending_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pending_admin: (options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a receive_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  receive_tokens: ({sender, message_id, message, attestation, extra_gas_amount}: {sender: string, message_id: Buffer, message: Buffer, attestation: Buffer, extra_gas_amount: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_gas_oracle: ({gas_oracle}: {gas_oracle: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_chain_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_chain_bridge: ({chain_id}: {chain_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<ChainBridge>>>

  /**
   * Construct and simulate a set_max_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_max_fee_share: ({value}: {value: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a admin_fee_share_bp transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  admin_fee_share_bp: (options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a native_fee_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  native_fee_balance: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a message_transmitter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  message_transmitter: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a set_admin_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin_fee_share: ({admin_fee_share_bp}: {admin_fee_share_bp: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a update_chain_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_chain_bridge: ({chain_id, gas_usage, domain, other_bridge}: {chain_id: u32, gas_usage: u128, domain: u32, other_bridge: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a withdraw_gas_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw_gas_tokens: ({sender, amount}: {sender: string, amount: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_transaction_cost transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_transaction_cost: ({chain_id}: {chain_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u128>>>

  /**
   * Construct and simulate a cancel_admin_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraws the pending nomination. Admin only.
   */
  cancel_admin_transfer: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a register_chain_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_chain_bridge: ({chain_id, gas_usage, domain, other_bridge}: {chain_id: u32, gas_usage: u128, domain: u32, other_bridge: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a bridging_fee_in_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bridging_fee_in_tokens: ({token_address}: {token_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_domain_by_chain_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_domain_by_chain_id: ({chain_id}: {chain_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a min_finality_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  min_finality_threshold: (options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a token_messenger_minter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  token_messenger_minter: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a set_message_transmitter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_message_transmitter: ({message_transmitter}: {message_transmitter: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unregister_chain_bridge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Removes the route to a chain, so the bridge no longer sends there. Receiving is not affected.
   */
  unregister_chain_bridge: ({chain_id}: {chain_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_fee_conversion_factor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_fee_conversion_factor: ({value}: {value: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_min_finality_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_min_finality_threshold: ({value}: {value: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_token_messenger_minter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_token_messenger_minter: ({token_messenger_minter}: {token_messenger_minter: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_bridging_cost_in_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bridging_cost_in_tokens: ({chain_id}: {chain_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u128>>>

  /**
   * Construct and simulate a bridging_fee_conversion_factor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bridging_fee_conversion_factor: (options?: MethodOptions) => Promise<AssembledTransaction<Result<u128>>>

  /**
   * Construct and simulate a withdraw_bridging_fee_in_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw_bridging_fee_in_tokens: ({sender, token_address}: {sender: string, token_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, usdc_token, token_messenger_minter, message_transmitter, gas_oracle, native_token, min_finality_threshold, max_fee_share, admin_fee_share_bp, bridging_fee_conversion_factor}: {admin: string, usdc_token: string, token_messenger_minter: string, message_transmitter: string, gas_oracle: string, native_token: string, min_finality_threshold: u32, max_fee_share: i128, admin_fee_share_bp: u64, bridging_fee_conversion_factor: u128},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin, usdc_token, token_messenger_minter, message_transmitter, gas_oracle, native_token, min_finality_threshold, max_fee_share, admin_fee_share_bp, bridging_fee_conversion_factor}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAClJlY2VpdmVGZWUAAAAAAAMAAAAAAAAAF2JyaWRnZV90cmFuc2FjdGlvbl9jb3N0AAAAAAoAAAAAAAAACWV4dHJhX2dhcwAAAAAAAAoAAAAAAAAAGG1lc3NhZ2VfdHJhbnNhY3Rpb25fY29zdAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClRva2Vuc1NlbnQAAAAAAAUAAAAAAAAACWFkbWluX2ZlZQAAAAAAAAoAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAUZGVzdGluYXRpb25fY2hhaW5faWQAAAAEAAAAAAAAAAlyZWNpcGllbnQAAAAAAAPuAAAAIAAAAAAAAAAGc2VuZGVyAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAADlRva2Vuc1JlY2VpdmVkAAAAAAAFAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAD2V4dHJhX2dhc192YWx1ZQAAAAAKAAAAAAAAAAptZXNzYWdlX2lkAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAScmVjaXBpZW50X211eGVkX2lkAAAAAAPoAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAEEFkbWluVHJhbnNmZXJyZWQAAAACAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAAAAAA5wcmV2aW91c19hZG1pbgAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAFEFkbWluVHJhbnNmZXJTdGFydGVkAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA1wZW5kaW5nX2FkbWluAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAFUJyaWRnaW5nRmVlRnJvbVRva2VucwAAAAAAAAIAAAAAAAAAEGZlZV90b2tlbl9hbW91bnQAAAAKAAAAAAAAAANnYXMAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAFkFkbWluVHJhbnNmZXJDYW5jZWxsZWQAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANcGVuZGluZ19hZG1pbgAAAAAAABM=",
        "AAAAAQAAAAAAAAAAAAAAC0NoYWluQnJpZGdlAAAAAAQAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAAGZG9tYWluAAAAAAAEAAAAAAAAAAlnYXNfdXNhZ2UAAAAAAAAKAAAAAAAAAAxvdGhlcl9icmlkZ2UAAAPuAAAAIA==",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAACwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABJhZG1pbl9mZWVfc2hhcmVfYnAAAAAAAAYAAAAAAAAAHmJyaWRnaW5nX2ZlZV9jb252ZXJzaW9uX2ZhY3RvcgAAAAAACgAAAAAAAAAKZ2FzX29yYWNsZQAAAAAAEwAAAAAAAAANbWF4X2ZlZV9zaGFyZQAAAAAAAAsAAAAAAAAAE21lc3NhZ2VfdHJhbnNtaXR0ZXIAAAAAEwAAAAAAAAAWbWluX2ZpbmFsaXR5X3RocmVzaG9sZAAAAAAABAAAAAAAAAAMbmF0aXZlX3Rva2VuAAAAEwAAAAAAAAAOb3V0Ym91bmRfbm9uY2UAAAAAAAoAAAAAAAAAFnRva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAABMAAAAAAAAACnVzZGNfdG9rZW4AAAAAABM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABkNvbmZpZwAAAAAAAQAAAAAAAAALQ2hhaW5CcmlkZ2UAAAAAAQAAAAQAAAABAAAAAAAAAAZEb21haW4AAAAAAAEAAAAEAAAAAAAAAAAAAAAMUGVuZGluZ0FkbWlu",
        "AAAAAAAAAAAAAAAFYWRtaW4AAAAAAAAAAAAAAQAAA+kAAAATAAAAAw==",
        "AAAAAAAAAAAAAAAGYnJpZGdlAAAAAAAGAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAJcmVjaXBpZW50AAAAAAAD7gAAACAAAAAAAAAAFGRlc3RpbmF0aW9uX2NoYWluX2lkAAAABAAAAAAAAAAKZ2FzX2Ftb3VudAAAAAAACgAAAAAAAAAQZmVlX3Rva2VuX2Ftb3VudAAAAAoAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAFFOb21pbmF0ZXMgdGhlIG5ldyBhZG1pbi4gSXQgYmVjb21lcyB0aGUgYWRtaW4gb25seSBhZnRlciBpdCBjYWxscyBgYWNjZXB0X2FkbWluYC4AAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAKZ2FzX29yYWNsZQAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
        "AAAAAAAAAAAAAAAKdXNkY190b2tlbgAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
        "AAAAAAAAAFlDb21wbGV0ZXMgdGhlIGFkbWluIGhhbmRvdmVyLiBNdXN0IGJlIGF1dGhvcml6ZWQgYnkgdGhlIGFkbWluIG5vbWluYXRlZCB3aXRoIGBzZXRfYWRtaW5gLgAAAAAAAAxhY2NlcHRfYWRtaW4AAAAAAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAMbmF0aXZlX3Rva2VuAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
        "AAAAAAAAAF1DYWxsZWQgYnkgdGhlIGhvc3QgZXhhY3RseSBvbmNlLCB3aGVuIHRoZSBjb250cmFjdCBpcyBjcmVhdGVkLiBJdCBpcyBub3QgY2FsbGFibGUgYWZ0ZXJ3YXJkcy4AAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAKdXNkY190b2tlbgAAAAAAEwAAAAAAAAAWdG9rZW5fbWVzc2VuZ2VyX21pbnRlcgAAAAAAEwAAAAAAAAATbWVzc2FnZV90cmFuc21pdHRlcgAAAAATAAAAAAAAAApnYXNfb3JhY2xlAAAAAAATAAAAAAAAAAxuYXRpdmVfdG9rZW4AAAATAAAAAAAAABZtaW5fZmluYWxpdHlfdGhyZXNob2xkAAAAAAAEAAAAAAAAAA1tYXhfZmVlX3NoYXJlAAAAAAAACwAAAAAAAAASYWRtaW5fZmVlX3NoYXJlX2JwAAAAAAAGAAAAAAAAAB5icmlkZ2luZ19mZWVfY29udmVyc2lvbl9mYWN0b3IAAAAAAAoAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAANbWF4X2ZlZV9zaGFyZQAAAAAAAAAAAAABAAAD6QAAAAsAAAAD",
        "AAAAAAAAAAAAAAANcGVuZGluZ19hZG1pbgAAAAAAAAAAAAABAAAD6AAAABM=",
        "AAAAAAAAAAAAAAAOcmVjZWl2ZV90b2tlbnMAAAAAAAUAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAKbWVzc2FnZV9pZAAAAAAD7gAAACAAAAAAAAAAB21lc3NhZ2UAAAAADgAAAAAAAAALYXR0ZXN0YXRpb24AAAAADgAAAAAAAAAQZXh0cmFfZ2FzX2Ftb3VudAAAAAoAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAOc2V0X2dhc19vcmFjbGUAAAAAAAEAAAAAAAAACmdhc19vcmFjbGUAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAQZ2V0X2NoYWluX2JyaWRnZQAAAAEAAAAAAAAACGNoYWluX2lkAAAABAAAAAEAAAPpAAAH0AAAAAtDaGFpbkJyaWRnZQAAAAAD",
        "AAAAAAAAAAAAAAARc2V0X21heF9mZWVfc2hhcmUAAAAAAAABAAAAAAAAAAV2YWx1ZQAAAAAAAAsAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAASYWRtaW5fZmVlX3NoYXJlX2JwAAAAAAAAAAAAAQAAA+kAAAAGAAAAAw==",
        "AAAAAAAAAAAAAAASbmF0aXZlX2ZlZV9iYWxhbmNlAAAAAAAAAAAAAQAAA+kAAAALAAAAAw==",
        "AAAAAAAAAAAAAAATbWVzc2FnZV90cmFuc21pdHRlcgAAAAAAAAAAAQAAA+kAAAATAAAAAw==",
        "AAAAAAAAAAAAAAATc2V0X2FkbWluX2ZlZV9zaGFyZQAAAAABAAAAAAAAABJhZG1pbl9mZWVfc2hhcmVfYnAAAAAAAAYAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAATdXBkYXRlX2NoYWluX2JyaWRnZQAAAAAEAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAAAAAAACWdhc191c2FnZQAAAAAAAAoAAAAAAAAABmRvbWFpbgAAAAAABAAAAAAAAAAMb3RoZXJfYnJpZGdlAAAD7gAAACAAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAATd2l0aGRyYXdfZ2FzX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAUZ2V0X3RyYW5zYWN0aW9uX2Nvc3QAAAABAAAAAAAAAAhjaGFpbl9pZAAAAAQAAAABAAAD6QAAAAoAAAAD",
        "AAAAAAAAAC1XaXRoZHJhd3MgdGhlIHBlbmRpbmcgbm9taW5hdGlvbi4gQWRtaW4gb25seS4AAAAAAAAVY2FuY2VsX2FkbWluX3RyYW5zZmVyAAAAAAAAAAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAVcmVnaXN0ZXJfY2hhaW5fYnJpZGdlAAAAAAAABAAAAAAAAAAIY2hhaW5faWQAAAAEAAAAAAAAAAlnYXNfdXNhZ2UAAAAAAAAKAAAAAAAAAAZkb21haW4AAAAAAAQAAAAAAAAADG90aGVyX2JyaWRnZQAAA+4AAAAgAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAWYnJpZGdpbmdfZmVlX2luX3Rva2VucwAAAAAAAQAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAAAAAAAAWZ2V0X2RvbWFpbl9ieV9jaGFpbl9pZAAAAAAAAQAAAAAAAAAIY2hhaW5faWQAAAAEAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAAAAAAAAWbWluX2ZpbmFsaXR5X3RocmVzaG9sZAAAAAAAAAAAAAEAAAPpAAAABAAAAAM=",
        "AAAAAAAAAAAAAAAWdG9rZW5fbWVzc2VuZ2VyX21pbnRlcgAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=",
        "AAAAAAAAAAAAAAAXc2V0X21lc3NhZ2VfdHJhbnNtaXR0ZXIAAAAAAQAAAAAAAAATbWVzc2FnZV90cmFuc21pdHRlcgAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAF1SZW1vdmVzIHRoZSByb3V0ZSB0byBhIGNoYWluLCBzbyB0aGUgYnJpZGdlIG5vIGxvbmdlciBzZW5kcyB0aGVyZS4gUmVjZWl2aW5nIGlzIG5vdCBhZmZlY3RlZC4AAAAAAAAXdW5yZWdpc3Rlcl9jaGFpbl9icmlkZ2UAAAAAAQAAAAAAAAAIY2hhaW5faWQAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAZc2V0X2ZlZV9jb252ZXJzaW9uX2ZhY3RvcgAAAAAAAAEAAAAAAAAABXZhbHVlAAAAAAAACgAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAac2V0X21pbl9maW5hbGl0eV90aHJlc2hvbGQAAAAAAAEAAAAAAAAABXZhbHVlAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAac2V0X3Rva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAAAEAAAAAAAAAFnRva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAbZ2V0X2JyaWRnaW5nX2Nvc3RfaW5fdG9rZW5zAAAAAAEAAAAAAAAACGNoYWluX2lkAAAABAAAAAEAAAPpAAAACgAAAAM=",
        "AAAAAAAAAAAAAAAeYnJpZGdpbmdfZmVlX2NvbnZlcnNpb25fZmFjdG9yAAAAAAAAAAAAAQAAA+kAAAAKAAAAAw==",
        "AAAAAAAAAAAAAAAfd2l0aGRyYXdfYnJpZGdpbmdfZmVlX2luX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADQAAAAAAAAALSW5pdGlhbGl6ZWQAAAAAAQAAAAAAAAANVW5pbml0aWFsaXplZAAAAAAAAAIAAAAAAAAACkludmFsaWRBcmcAAAAAAAQAAAAAAAAADkludmFsaWRDaGFpbklkAAAAAAAFAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAAMVTI1Nk92ZXJmbG93AAAADAAAAAAAAAASQW1vdW50VG9vTG93Rm9yRmVlAAAAAADNAAAAAAAAABVXcm9uZ0Rlc3RpbmF0aW9uQ2hhaW4AAAAAAADRAAAAAAAAABNVbmtub3duQW5vdGhlckNoYWluAAAAANIAAAAAAAAADE5vdEVub3VnaEZlZQAAANYAAAAAAAAACU5vTWVzc2FnZQAAAAAAANcAAAAAAAAADk5vUGVuZGluZ0FkbWluAAAAAADYAAAAAAAAABFOb0dhc0RhdGFGb3JDaGFpbgAAAAAAAZA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    admin: this.txFromJSON<Result<string>>,
        bridge: this.txFromJSON<Result<void>>,
        upgrade: this.txFromJSON<Result<void>>,
        set_admin: this.txFromJSON<Result<void>>,
        gas_oracle: this.txFromJSON<Result<string>>,
        usdc_token: this.txFromJSON<Result<string>>,
        accept_admin: this.txFromJSON<Result<void>>,
        native_token: this.txFromJSON<Result<string>>,
        max_fee_share: this.txFromJSON<Result<i128>>,
        pending_admin: this.txFromJSON<Option<string>>,
        receive_tokens: this.txFromJSON<Result<void>>,
        set_gas_oracle: this.txFromJSON<Result<void>>,
        get_chain_bridge: this.txFromJSON<Result<ChainBridge>>,
        set_max_fee_share: this.txFromJSON<Result<void>>,
        admin_fee_share_bp: this.txFromJSON<Result<u64>>,
        native_fee_balance: this.txFromJSON<Result<i128>>,
        message_transmitter: this.txFromJSON<Result<string>>,
        set_admin_fee_share: this.txFromJSON<Result<void>>,
        update_chain_bridge: this.txFromJSON<Result<void>>,
        withdraw_gas_tokens: this.txFromJSON<Result<void>>,
        get_transaction_cost: this.txFromJSON<Result<u128>>,
        cancel_admin_transfer: this.txFromJSON<Result<void>>,
        register_chain_bridge: this.txFromJSON<Result<void>>,
        bridging_fee_in_tokens: this.txFromJSON<i128>,
        get_domain_by_chain_id: this.txFromJSON<Result<u32>>,
        min_finality_threshold: this.txFromJSON<Result<u32>>,
        token_messenger_minter: this.txFromJSON<Result<string>>,
        set_message_transmitter: this.txFromJSON<Result<void>>,
        unregister_chain_bridge: this.txFromJSON<Result<void>>,
        set_fee_conversion_factor: this.txFromJSON<Result<void>>,
        set_min_finality_threshold: this.txFromJSON<Result<void>>,
        set_token_messenger_minter: this.txFromJSON<Result<void>>,
        get_bridging_cost_in_tokens: this.txFromJSON<Result<u128>>,
        bridging_fee_conversion_factor: this.txFromJSON<Result<u128>>,
        withdraw_bridging_fee_in_tokens: this.txFromJSON<Result<void>>
  }
}
