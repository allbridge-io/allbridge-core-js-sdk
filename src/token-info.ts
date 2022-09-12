export class TokenInfo {
  private readonly _entries: TokenInfoEntries;

  constructor(entries: TokenInfoEntries) {
    this._entries = entries;
  }

  get entries(): TokenInfoEntries {
    return this._entries;
  }
}

export type TokenInfoEntries = {
  [chainSymbol: string]: ChainDetails;
};

export interface ChainDetails {
  tokens: TokenDetails[];
  chainId: number;
  bridgeAddress: string;
  txTime: TxTime;
  confirmations: number;
}

export interface TokenDetails {
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
