// @ts-expect-error import tron
import * as TronWeb from "tronweb";

import Web3 from "web3";

/**
 * The provider is type that combines connection implementations for different chains.<br/>
 * TIP: None provider in the Solana blockchain case.
 */
export type Provider = Web3 | typeof TronWeb;

export type RawTransaction = Object;

export interface SmartContractMethodParameter {
  type: string;
  value: string | number | number[];
}
