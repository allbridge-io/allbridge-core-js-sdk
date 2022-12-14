/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from "bn.js";
import type { ContractOptions } from "web3-eth-contract";
import type { EventLog } from "web3-core";
import type { EventEmitter } from "events";
import type {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;
export type Received = ContractEventLog<{
  0: string;
  1: string;
}>;
export type TokensSent = ContractEventLog<{
  amount: string;
  recipient: string;
  destinationChainId: string;
  receiveToken: string;
  nonce: string;
  messenger: string;
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}>;

export interface Abi extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): Abi;
  clone(): Abi;
  methods: {
    addBridgeToken(
      chainId_: number | string | BN,
      tokenAddress_: string | number[]
    ): NonPayableTransactionObject<void>;

    addPool(
      pool: string,
      token: string | number[]
    ): NonPayableTransactionObject<void>;

    allbridgeMessenger(): NonPayableTransactionObject<string>;

    chainId(): NonPayableTransactionObject<string>;

    gasUsage(arg0: number | string | BN): NonPayableTransactionObject<string>;

    getMessageCost(
      chainId: number | string | BN,
      protocol: number | string | BN
    ): NonPayableTransactionObject<string>;

    getTransactionCost(
      chainId_: number | string | BN
    ): NonPayableTransactionObject<string>;

    hasReceivedMessage(
      message: string | number[],
      protocol: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    hasSentMessage(
      message: string | number[]
    ): NonPayableTransactionObject<boolean>;

    hashMessage(
      amount: number | string | BN,
      recipient: string | number[],
      sourceChainId: number | string | BN,
      destinationChainId: number | string | BN,
      receiveToken: string | number[],
      nonce: number | string | BN,
      messenger: number | string | BN
    ): NonPayableTransactionObject<string>;

    otherBridgeTokens(
      arg0: number | string | BN,
      arg1: string | number[]
    ): NonPayableTransactionObject<boolean>;

    otherBridges(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    owner(): NonPayableTransactionObject<string>;

    pools(arg0: string | number[]): NonPayableTransactionObject<string>;

    processedMessages(
      arg0: string | number[]
    ): NonPayableTransactionObject<boolean>;

    receiveTokens(
      amount: number | string | BN,
      recipient: string | number[],
      sourceChainId: number | string | BN,
      receiveToken: string | number[],
      nonce: number | string | BN,
      messenger: number | string | BN
    ): NonPayableTransactionObject<void>;

    registerBridge(
      chainId_: number | string | BN,
      bridgeAddress_: string | number[]
    ): NonPayableTransactionObject<void>;

    removeBridgeToken(
      chainId_: number | string | BN,
      tokenAddress_: string | number[]
    ): NonPayableTransactionObject<void>;

    renounceOwnership(): NonPayableTransactionObject<void>;

    sentMessages(arg0: string | number[]): NonPayableTransactionObject<boolean>;

    setAllbridgeMessenger(
      _allbridgeMessenger: string
    ): NonPayableTransactionObject<void>;

    setGasOracle(gasOracle_: string): NonPayableTransactionObject<void>;

    setGasUsage(
      chainId_: number | string | BN,
      gasUsage_: number | string | BN
    ): NonPayableTransactionObject<void>;

    setWormholeMessenger(
      _wormholeMessenger: string
    ): NonPayableTransactionObject<void>;

    swap(
      amount: number | string | BN,
      token: string | number[],
      receiveToken: string | number[],
      recipient: string
    ): NonPayableTransactionObject<void>;

    swapAndBridge(
      token: string | number[],
      amount: number | string | BN,
      recipient: string | number[],
      destinationChainId: number | string | BN,
      receiveToken: string | number[],
      nonce: number | string | BN,
      messenger: number | string | BN
    ): PayableTransactionObject<void>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;

    withdrawGasTokens(
      amount: number | string | BN
    ): NonPayableTransactionObject<void>;

    wormholeMessenger(): NonPayableTransactionObject<string>;
  };
  events: {
    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    Received(cb?: Callback<Received>): EventEmitter;
    Received(options?: EventOptions, cb?: Callback<Received>): EventEmitter;

    TokensSent(cb?: Callback<TokensSent>): EventEmitter;
    TokensSent(options?: EventOptions, cb?: Callback<TokensSent>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;

  once(event: "Received", cb: Callback<Received>): void;
  once(event: "Received", options: EventOptions, cb: Callback<Received>): void;

  once(event: "TokensSent", cb: Callback<TokensSent>): void;
  once(
    event: "TokensSent",
    options: EventOptions,
    cb: Callback<TokensSent>
  ): void;
}
