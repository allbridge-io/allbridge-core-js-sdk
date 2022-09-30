import { BasicChainProperties } from "./models";

export * from "./models";

export enum ChainSymbol {
  KVN = "KVN",
  RPS = "RPS",
  GRL = "GRL",
  BSC = "BSC",
  ETH = "ETH",
  SOL = "SOL",
  TRX = "TRX",
}

export const chainProperties: Record<string, BasicChainProperties> = {
  [ChainSymbol.KVN]: {
    chainSymbol: ChainSymbol.KVN,
    chainId: "0x2a",
    name: "Kovan",
  },
  [ChainSymbol.RPS]: {
    chainSymbol: ChainSymbol.RPS,
    chainId: "0x3",
    name: "Ropsten",
  },
  [ChainSymbol.GRL]: {
    chainSymbol: ChainSymbol.GRL,
    chainId: "0x5",
    name: "Goerli",
  },
  [ChainSymbol.BSC]: {
    chainSymbol: ChainSymbol.BSC,
    chainId: "0x38",
    name: "BNB Chain",
  },
  [ChainSymbol.ETH]: {
    chainSymbol: ChainSymbol.ETH,
    chainId: "0x1",
    name: "Ethereum",
  },
  [ChainSymbol.SOL]: {
    chainSymbol: ChainSymbol.SOL,
    name: "Solana",
  },
  [ChainSymbol.TRX]: {
    chainSymbol: ChainSymbol.TRX,
    name: "Tron",
  },
};
