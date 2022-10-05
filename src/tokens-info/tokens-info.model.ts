import { BasicChainProperties } from "../chains";
import { Messenger } from "../client/core-api/core-api.model";

/**
 * Contains mapping of {@link ChainSymbol} and chain details.
 */
export type ChainDetailsMap = Record<string, ChainDetailsWithTokens>;

export interface ChainDetails extends BasicChainProperties {
  allbridgeChainId: number;
  bridgeAddress: string;
  txTime: TxTime;
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
  poolInfo: PoolInfo;
  feeShare: string;
  apr: number;
  lpRate: number;
}

export interface TokenInfoWithChainDetails extends TokenInfo {
  chainSymbol: string;
  chainId?: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  allbridgeChainId: number;
  bridgeAddress: string;
  txTime: TxTime;
  confirmations: number;
}

export interface PoolInfo {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
}

export interface MessengerTxTime {
  in: number;
  out: number;
}

/**
 * Contains average transaction times per messenger.
 */
export type TxTime = {
  [messenger in Messenger]?: MessengerTxTime;
};
