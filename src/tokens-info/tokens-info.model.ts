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
  confirmations: number;
}

export interface ChainDetailsWithTokens extends ChainDetails {
  tokens: TokenInfoWithChainDetails[];
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  feeShare: string;
  apr: number;
  lpRate: number;
}

export interface TokenInfoWithChainDetails extends TokenInfo {
  chainSymbol: string;
  chainType: string;
  chainId?: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  allbridgeChainId: number;
  bridgeAddress: string;
  transferTime: TransferTime;
  confirmations: number;
}

export interface PoolInfo {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
  p: number;
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

export type PoolInfoMap = Record<string, PoolInfo>;
