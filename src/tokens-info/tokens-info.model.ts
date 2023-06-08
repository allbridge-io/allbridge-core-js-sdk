import { BasicChainProperties, ChainSymbol } from "../chains";
import { Messenger } from "../client/core-api/core-api.model";

/**
 * Contains mapping of {@link ChainSymbol} and chain details.
 */
export type ChainDetailsMap = Record<string, ChainDetailsWithTokens>;

export interface ChainDetails extends BasicChainProperties {
  allbridgeChainId: number;
  bridgeAddress: string;
  transferTime: TransferTime;
  txCostAmount: TxCostAmount;
  confirmations: number;
}

export interface ChainDetailsWithTokens extends ChainDetails {
  tokens: TokenWithChainDetails[];
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  feeShare: string;
  apr: number;
  lpRate: number;
}

export interface TokenWithChainDetails extends Token, Omit<ChainDetails, "name"> {
  chainName: string;
}

export interface PoolInfo {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
  p: number;
  imbalance: string;
}

/**
 * Contains average transaction times per chain per messenger.
 */
export type TransferTime = {
  [chain in ChainSymbol]?: MessengerTransferTime;
};

export type MessengerTransferTime = {
  [messenger in Messenger]?: number;
};

export interface PoolKeyObject {
  chainSymbol: ChainSymbol;
  poolAddress: string;
}

export interface TxCostAmount {
  maxAmount: string;
  swap: string;
  transfer: string;
}

export type PoolInfoMap = Record<string, PoolInfo>;
