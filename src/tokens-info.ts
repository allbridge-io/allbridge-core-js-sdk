import { ChainProperties } from "./chains";

export class TokensInfo {
  private readonly _entries: TokensInfoEntries;

  constructor(entries: TokensInfoEntries) {
    this._entries = entries;
  }

  tokens = (
    groupByChain = true
  ): TokensInfoEntries | TokenInfoWithChainDetails[] => {
    if (groupByChain) {
      return this._entries;
    } else {
      return Object.values(this._entries).flatMap((chainDetails) =>
        chainDetails.tokens.map((tokenInfo) => {
          return {
            ...tokenInfo,
            chainSymbol: chainDetails.chainSymbol,
            chainId: chainDetails.chainId,
            chainName: chainDetails.name,
            allbridgeChainId: chainDetails.allbridgeChainId,
            bridgeAddress: chainDetails.bridgeAddress,
            txTime: chainDetails.txTime,
            confirmations: chainDetails.confirmations,
          };
        })
      );
    }
  };
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
