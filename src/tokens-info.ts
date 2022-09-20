import { ChainProperties } from "./chains";

export class TokensInfo {
  private readonly _entries: TokensInfoEntries;

  constructor(entries: TokensInfoEntries) {
    this._entries = entries;
  }

  get entries(): TokensInfoEntries {
    return this._entries;
  }
}

export type TokensInfoEntries = Record<string, ChainDetails>;

export interface ChainDetails extends ChainProperties {
  tokens: TokenInfo[];
  allbridgeChainId: number;
  bridgeAddress: string;
  txTime: TxTime;
  confirmations: number;
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

export interface PoolInfo {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
}

export enum MessengerKey {
  ALLBRIDGE = "allbridge",
  WORMHOLE = "wormhole",
}

export interface Messenger {
  in: number;
  out: number;
}

export type TxTime = {
  [messenger in MessengerKey]: Messenger;
};
