import { BasicChainProperties, ChainSymbol } from "../chains";
import { Messenger } from "../client/core-api/core-api.model";

/**
 * Contains mapping of {@link ChainSymbol} and chain details.
 */
export type ChainDetailsMap = Record<string, ChainDetailsWithTokens>;

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
   * Token APR
   */
  apr: number;
  /**
   * Token LP rate
   */
  lpRate: number;
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
 * Contains average transaction times per chain per messenger.
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
  chainSymbol: ChainSymbol;
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
