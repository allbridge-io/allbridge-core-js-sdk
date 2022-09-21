import { ChainProperties } from "./chains";

export class TokensInfo {
  private readonly _map: ChainDetailsMap;

  constructor(map: ChainDetailsMap) {
    this._map = map;
  }

  chainDetailsMap(): ChainDetailsMap {
    return this._map;
  }

  tokens(): TokenInfoWithChainDetails[] {
    return Object.values(this._map).flatMap((chainDetails) => {
      const {
        tokens: _tokens,
        name: chainName,
        ...chainDetailsWithoutTokensAndName
      } = chainDetails;
      return chainDetails.tokens.map((tokenInfo) => {
        return {
          ...tokenInfo,
          ...chainDetailsWithoutTokensAndName,
          chainName,
        };
      });
    });
  }
}

export type ChainDetailsMap = Record<string, ChainDetails>;

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
