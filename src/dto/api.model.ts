export type ChainDetailsMapDTO = Record<string, ChainDetailsDTO>;

export interface ChainDetailsDTO {
  tokens: TokenDTO[];
  chainId: number;
  bridgeAddress: string;
  txTime: TxTimeDTO;
  confirmations: number;
}

export interface TokenDTO {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  poolInfo: PoolInfoDTO;
  feeShare: string;
  apr: number;
  lpRate: number;
}

export interface PoolInfoDTO {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
}

export enum MessengerKeyDTO {
  ALLBRIDGE = "allbridge",
  WORMHOLE = "wormhole",
}

export type TxTimeDTO = {
  [messenger in MessengerKeyDTO]: MessengerDTO;
};

export interface MessengerDTO {
  in: number;
  out: number;
}
