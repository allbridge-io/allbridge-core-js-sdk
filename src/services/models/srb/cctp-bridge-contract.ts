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
    contractId: "CAYUCAP2ORC5PSASKC63MQGMB6X62YXDADCSPDBZNHHHG33GKNZUYROB",
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
  source_chain_id: u32;
}


export interface BridgingFeeFromTokens {
  fee_token_amount: u128;
  gas: u128;
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

export type DataKey = {tag: "Config", values: void} | {tag: "ChainBridge", values: readonly [u32]} | {tag: "Domain", values: readonly [u32]};

export type NativeToken = readonly [string];

export type StopAuthority = readonly [string];

export type GasOracleAddress = readonly [string];

export type Admin = readonly [string];

export type GasUsage = readonly [Map<u32, u128>];

export const Errors = {
  0: {message:"Unimplemented"},
  1: {message:"Initialized"},
  2: {message:"Uninitialized"},
  3: {message:"Unauthorized"},
  4: {message:"InvalidArg"},
  5: {message:"InvalidChainId"},
  6: {message:"InvalidOtherChainId"},
  7: {message:"GasUsageNotSet"},
  8: {message:"BrokenAddress"},
  9: {message:"NotFound"},
  10: {message:"TokenInsufficientBalance"},
  11: {message:"CastFailed"},
  12: {message:"U256Overflow"},
  103: {message:"ZeroAmount"},
  104: {message:"PoolOverflow"},
  105: {message:"ZeroChanges"},
  106: {message:"ReservesExhausted"},
  107: {message:"InsufficientReceivedAmount"},
  108: {message:"BalanceRatioExceeded"},
  109: {message:"Forbidden"},
  203: {message:"UnauthorizedStopAuthority"},
  204: {message:"SwapProhibited"},
  205: {message:"AmountTooLowForFee"},
  206: {message:"BridgeToTheZeroAddress"},
  207: {message:"EmptyRecipient"},
  208: {message:"SourceNotRegistered"},
  209: {message:"WrongDestinationChain"},
  210: {message:"UnknownAnotherChain"},
  211: {message:"TokensAlreadySent"},
  212: {message:"MessageProcessed"},
  214: {message:"NotEnoughFee"},
  215: {message:"NoMessage"},
  216: {message:"NoReceivePool"},
  217: {message:"NoPool"},
  218: {message:"UnknownAnotherToken"},
  300: {message:"WrongByteLength"},
  301: {message:"HasMessage"},
  302: {message:"InvalidPrimarySignature"},
  303: {message:"InvalidSecondarySignature"},
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
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  gas_oracle: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, usdc_token, token_messenger_minter, message_transmitter, gas_oracle, native_token, min_finality_threshold, max_fee_share, admin_fee_share_bp, bridging_fee_conversion_factor}: {admin: string, usdc_token: string, token_messenger_minter: string, message_transmitter: string, gas_oracle: string, native_token: string, min_finality_threshold: u32, max_fee_share: i128, admin_fee_share_bp: u64, bridging_fee_conversion_factor: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a usdc_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  usdc_token: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a native_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  native_token: (options?: MethodOptions) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a max_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  max_fee_share: (options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a receive_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  receive_tokens: ({sender, message_id, message, attestation, extra_gas_amount}: {sender: string, message_id: Buffer, message: Buffer, attestation: Buffer, extra_gas_amount: u128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_gas_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_gas_oracle: ({gas_oracle}: {gas_oracle: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a bridge_with_hook transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bridge_with_hook: ({sender, amount, recipient, destination_chain_id, gas_amount, fee_token_amount, hook_data}: {sender: string, amount: u128, recipient: Buffer, destination_chain_id: u32, gas_amount: u128, fee_token_amount: u128, hook_data: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAClJlY2VpdmVGZWUAAAAAAAMAAAAAAAAAF2JyaWRnZV90cmFuc2FjdGlvbl9jb3N0AAAAAAoAAAAAAAAACWV4dHJhX2dhcwAAAAAAAAoAAAAAAAAAGG1lc3NhZ2VfdHJhbnNhY3Rpb25fY29zdAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClRva2Vuc1NlbnQAAAAAAAUAAAAAAAAACWFkbWluX2ZlZQAAAAAAAAoAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAUZGVzdGluYXRpb25fY2hhaW5faWQAAAAEAAAAAAAAAAlyZWNpcGllbnQAAAAAAAPuAAAAIAAAAAAAAAAGc2VuZGVyAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAADlRva2Vuc1JlY2VpdmVkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAD2V4dHJhX2dhc192YWx1ZQAAAAAKAAAAAAAAAAptZXNzYWdlX2lkAAAAAAPuAAAAIAAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAScmVjaXBpZW50X211eGVkX2lkAAAAAAPoAAAABgAAAAAAAAAPc291cmNlX2NoYWluX2lkAAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAAFUJyaWRnaW5nRmVlRnJvbVRva2VucwAAAAAAAAIAAAAAAAAAEGZlZV90b2tlbl9hbW91bnQAAAAKAAAAAAAAAANnYXMAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAC0NoYWluQnJpZGdlAAAAAAQAAAAAAAAACGNoYWluX2lkAAAABAAAAAAAAAAGZG9tYWluAAAAAAAEAAAAAAAAAAlnYXNfdXNhZ2UAAAAAAAAKAAAAAAAAAAxvdGhlcl9icmlkZ2UAAAPuAAAAIA==",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAACwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABJhZG1pbl9mZWVfc2hhcmVfYnAAAAAAAAYAAAAAAAAAHmJyaWRnaW5nX2ZlZV9jb252ZXJzaW9uX2ZhY3RvcgAAAAAACgAAAAAAAAAKZ2FzX29yYWNsZQAAAAAAEwAAAAAAAAANbWF4X2ZlZV9zaGFyZQAAAAAAAAsAAAAAAAAAE21lc3NhZ2VfdHJhbnNtaXR0ZXIAAAAAEwAAAAAAAAAWbWluX2ZpbmFsaXR5X3RocmVzaG9sZAAAAAAABAAAAAAAAAAMbmF0aXZlX3Rva2VuAAAAEwAAAAAAAAAOb3V0Ym91bmRfbm9uY2UAAAAAAAoAAAAAAAAAFnRva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAABMAAAAAAAAACnVzZGNfdG9rZW4AAAAAABM=",
        "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",
        "AAAAAAAAAAAAAAAXc2V0X21lc3NhZ2VfdHJhbnNtaXR0ZXIAAAAAAQAAAAAAAAATbWVzc2FnZV90cmFuc21pdHRlcgAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAZc2V0X2ZlZV9jb252ZXJzaW9uX2ZhY3RvcgAAAAAAAAEAAAAAAAAABXZhbHVlAAAAAAAACgAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAac2V0X21pbl9maW5hbGl0eV90aHJlc2hvbGQAAAAAAAEAAAAAAAAABXZhbHVlAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAac2V0X3Rva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAAAEAAAAAAAAAFnRva2VuX21lc3Nlbmdlcl9taW50ZXIAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAbZ2V0X2JyaWRnaW5nX2Nvc3RfaW5fdG9rZW5zAAAAAAEAAAAAAAAACGNoYWluX2lkAAAABAAAAAEAAAPpAAAACgAAAAM=",
        "AAAAAAAAAAAAAAAeYnJpZGdpbmdfZmVlX2NvbnZlcnNpb25fZmFjdG9yAAAAAAAAAAAAAQAAA+kAAAAKAAAAAw==",
        "AAAAAAAAAAAAAAAfd2l0aGRyYXdfYnJpZGdpbmdfZmVlX2luX3Rva2VucwAAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAQAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAEAAAAAAAAAATAAAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAADVN0b3BBdXRob3JpdHkAAAAAAAABAAAAAAAAAAEwAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAEEdhc09yYWNsZUFkZHJlc3MAAAABAAAAAAAAAAEwAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=",
        "AAAAAQAAAAAAAAAAAAAACEdhc1VzYWdlAAAAAQAAAAAAAAABMAAAAAAAA+wAAAAEAAAACg==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAKAAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA5JbnZhbGlkQ2hhaW5JZAAAAAAABQAAAAAAAAATSW52YWxpZE90aGVyQ2hhaW5JZAAAAAAGAAAAAAAAAA5HYXNVc2FnZU5vdFNldAAAAAAABwAAAAAAAAANQnJva2VuQWRkcmVzcwAAAAAAAAgAAAAAAAAACE5vdEZvdW5kAAAACQAAAAAAAAAYVG9rZW5JbnN1ZmZpY2llbnRCYWxhbmNlAAAACgAAAAAAAAAKQ2FzdEZhaWxlZAAAAAAACwAAAAAAAAAMVTI1Nk92ZXJmbG93AAAADAAAAAAAAAAKWmVyb0Ftb3VudAAAAAAAZwAAAAAAAAAMUG9vbE92ZXJmbG93AAAAaAAAAAAAAAALWmVyb0NoYW5nZXMAAAAAaQAAAAAAAAARUmVzZXJ2ZXNFeGhhdXN0ZWQAAAAAAABqAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAawAAAAAAAAAUQmFsYW5jZVJhdGlvRXhjZWVkZWQAAABsAAAAAAAAAAlGb3JiaWRkZW4AAAAAAABtAAAAAAAAABlVbmF1dGhvcml6ZWRTdG9wQXV0aG9yaXR5AAAAAAAAywAAAAAAAAAOU3dhcFByb2hpYml0ZWQAAAAAAMwAAAAAAAAAEkFtb3VudFRvb0xvd0ZvckZlZQAAAAAAzQAAAAAAAAAWQnJpZGdlVG9UaGVaZXJvQWRkcmVzcwAAAAAAzgAAAAAAAAAORW1wdHlSZWNpcGllbnQAAAAAAM8AAAAAAAAAE1NvdXJjZU5vdFJlZ2lzdGVyZWQAAAAA0AAAAAAAAAAVV3JvbmdEZXN0aW5hdGlvbkNoYWluAAAAAAAA0QAAAAAAAAATVW5rbm93bkFub3RoZXJDaGFpbgAAAADSAAAAAAAAABFUb2tlbnNBbHJlYWR5U2VudAAAAAAAANMAAAAAAAAAEE1lc3NhZ2VQcm9jZXNzZWQAAADUAAAAAAAAAAxOb3RFbm91Z2hGZWUAAADWAAAAAAAAAAlOb01lc3NhZ2UAAAAAAADXAAAAAAAAAA1Ob1JlY2VpdmVQb29sAAAAAAAA2AAAAAAAAAAGTm9Qb29sAAAAAADZAAAAAAAAABNVbmtub3duQW5vdGhlclRva2VuAAAAANoAAAAAAAAAD1dyb25nQnl0ZUxlbmd0aAAAAAEsAAAAAAAAAApIYXNNZXNzYWdlAAAAAAEtAAAAAAAAABdJbnZhbGlkUHJpbWFyeVNpZ25hdHVyZQAAAAEuAAAAAAAAABlJbnZhbGlkU2Vjb25kYXJ5U2lnbmF0dXJlAAAAAAABLwAAAAAAAAARTm9HYXNEYXRhRm9yQ2hhaW4AAAAAAAGQ" ]),
      options
    )
  }
  public readonly fromJSON = {
    admin: this.txFromJSON<Result<string>>,
    bridge: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
    set_admin: this.txFromJSON<Result<void>>,
    gas_oracle: this.txFromJSON<Result<string>>,
    initialize: this.txFromJSON<Result<void>>,
    usdc_token: this.txFromJSON<Result<string>>,
    native_token: this.txFromJSON<Result<string>>,
    max_fee_share: this.txFromJSON<Result<i128>>,
    receive_tokens: this.txFromJSON<Result<void>>,
    set_gas_oracle: this.txFromJSON<Result<void>>,
    bridge_with_hook: this.txFromJSON<Result<void>>,
    get_chain_bridge: this.txFromJSON<Result<ChainBridge>>,
    set_max_fee_share: this.txFromJSON<Result<void>>,
    admin_fee_share_bp: this.txFromJSON<Result<u64>>,
    native_fee_balance: this.txFromJSON<Result<i128>>,
    message_transmitter: this.txFromJSON<Result<string>>,
    set_admin_fee_share: this.txFromJSON<Result<void>>,
    update_chain_bridge: this.txFromJSON<Result<void>>,
    withdraw_gas_tokens: this.txFromJSON<Result<void>>,
    get_transaction_cost: this.txFromJSON<Result<u128>>,
    register_chain_bridge: this.txFromJSON<Result<void>>,
    bridging_fee_in_tokens: this.txFromJSON<i128>,
    get_domain_by_chain_id: this.txFromJSON<Result<u32>>,
    min_finality_threshold: this.txFromJSON<Result<u32>>,
    token_messenger_minter: this.txFromJSON<Result<string>>,
    set_message_transmitter: this.txFromJSON<Result<void>>,
    set_fee_conversion_factor: this.txFromJSON<Result<void>>,
    set_min_finality_threshold: this.txFromJSON<Result<void>>,
    set_token_messenger_minter: this.txFromJSON<Result<void>>,
    get_bridging_cost_in_tokens: this.txFromJSON<Result<u128>>,
    bridging_fee_conversion_factor: this.txFromJSON<Result<u128>>,
    withdraw_bridging_fee_in_tokens: this.txFromJSON<Result<void>>
  }
}
