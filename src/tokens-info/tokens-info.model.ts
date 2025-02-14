import { ChainSymbol } from "../chains/chain.enums";
import { BasicChainProperties } from "../chains/models";
import { Messenger } from "../client/core-api/core-api.model";

/**
 * Type representing a map of blockchain chain symbols to their corresponding details, including token information.
 *
 * @typedef {Record<string, ChainDetailsWithTokens>} ChainDetailsMap
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {ChainDetailsWithTokens} chainDetails - The detailed information of the specified chain, including token information.
 */
export type ChainDetailsMap = Record<string, ChainDetailsWithTokens>;

export type ChainDetailsMapWithFlags = Record<string, ChainDetailsWithTokensWithFlags>;

/**
 * Contains some blockchain details
 */
export interface ChainDetails extends BasicChainProperties {
  /**
   * Allbridge's Id
   */
  allbridgeChainId: number;
  /**
   * Bridge contract address
   */
  bridgeAddress: string;
  /**
   * Average transfer time to other blockchains
   */
  transferTime: TransferTime;
  /**
   * Transfers costs
   */
  txCostAmount: TxCostAmount;
  /**
   * Number of confirmations required
   */
  confirmations: number;
  /**
   * Sui addresses
   * Optional. Defined for SUI
   */
  suiAddresses?: SuiAddresses;
}

/**
 * Contains tokens list
 */
export interface ChainDetailsWithTokens extends ChainDetails {
  /**
   * Tokens
   */
  tokens: TokenWithChainDetails[];
}

/**
 * Contains tokens list
 */
export interface ChainDetailsWithTokensWithFlags extends ChainDetails {
  /**
   * Tokens
   */
  tokens: TokenWithChainDetailsWithFlags[];
}

/**
 * Contains token information
 */
export interface Token {
  /**
   * Token symbol
   */
  symbol: string;
  /**
   * Token name
   */
  name: string;
  /**
   * Token decimals
   */
  decimals: number;
  /**
   * Token pool address
   */
  poolAddress: string;
  /**
   * Token address
   */
  tokenAddress: string;
  /**
   * Token origin address
   */
  originTokenAddress?: string;
  /**
   * Token CCTP address</br>
   * Optional. Defined if CCTP supported by token
   */
  cctpAddress?: string;
  /**
   * Token CCTP address</br>
   * Optional. Defined if CCTP supported by token
   */
  cctpFeeShare?: string;
  /**
   * Token fee share
   */
  feeShare: string;
  /**
   * @deprecated use {@link apr7d}</br>
   * Token APR
   */
  apr: string;
  /**
   * Token APR based on last 7 days
   */
  apr7d: string;
  /**
   * Token APR based on last 30 days
   */
  apr30d: string;
  /**
   * Token LP rate
   */
  lpRate: string;
  /**
   * Sui addresses
   * Optional. Defined for SUI
   */
  suiAddresses?: SuiAddresses;
}

export interface SuiAddresses {
  bridgeAddress: string;
  bridgeAddressOrigin?: string;
  bridgeObjectAddress: string;

  allbridgeMessengerAddress: string;
  allbridgeMessengerAddressOrigin?: string;
  allbridgeMessengerObjectAddress: string;

  gasOracleAddress: string;
  gasOracleAddressOrigin?: string;
  gasOracleObjectAddress: string;

  utilsAddress: string;

  wormholeMessengerAddress: string;
  wormholeMessengerAddressOrigin?: string;
  wormholeMessengerObjectAddress: string;
  wormholeStateObjectAddress: string;

  cctpAddress: string;
  cctpAddressOrigin?: string;
  cctpObjectAddress: string;

  cctpDenyListObjectAddress: string;
  cctpMessageTransmitterStateObjectAddress: string;
  cctpTokenMessengerMinterStateObjectAddress: string;
  cctpTreasuryObjectAddress: string;
}

/**
 * General Token Interface
 */
export interface TokenWithChainDetails extends Token, Omit<ChainDetails, "name"> {
  /**
   * Blockchain network name
   */
  chainName: string;
}

export interface TokenWithChainDetailsWithFlags extends TokenWithChainDetails {
  flags: { swap: boolean; pool: boolean };
}

/**
 * General Pool Interface
 */
export interface PoolInfo {
  /**
   * Pool A value
   */
  aValue: string;
  /**
   * Pool D value
   */
  dValue: string;
  /**
   * Pool token balance
   */
  tokenBalance: string;
  /**
   * Pool virtual USD balance
   */
  vUsdBalance: string;
  /**
   * Pool total liquidity amount
   */
  totalLpAmount: string;
  /**
   * Current accumulated reward per share shifted by P bits
   */
  accRewardPerShareP: string;
  /**
   * P value, needed for accRewardPerShareP
   */
  p: number;
  /**
   * Pool imbalance
   */
  imbalance: string;
}

/**
 * Type representing transfer times for various blockchain chains.
 *
 * @typedef {Record<string, MessengerTransferTime>} TransferTime
 * @property {chain} chainSymbol
 * @property {MessengerTransferTime} transferTime - The average transfer time details for the specified chain.
 */
export type TransferTime = {
  [chain in ChainSymbol]?: MessengerTransferTime;
};

/**
 * Contains Avg transaction time withing different messenger protocols
 */
export type MessengerTransferTime = {
  [messenger in Messenger]?: number;
};

export interface PoolKeyObject {
  chainSymbol: string;
  poolAddress: string;
}

/**
 * Contains transfer costs
 */
export interface TxCostAmount {
  /**
   * The maximum gas amount that can be received as extra gas for one transfer
   */
  maxAmount: string;
  /**
   * Swap cost
   */
  swap: string;
  /**
   * Transfer cost
   */
  transfer: string;
}

export type PoolInfoMap = Record<string, PoolInfo>;
