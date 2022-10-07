import { BasicChainProperties } from "./models";

export * from "./models";

export enum ChainSymbol {
  /**
   * The Goerli testnet.
   */
  GRL = "GRL",

  /**
   * The BNB Smart Chain main network.
   */
  BSC = "BSC",

  /**
   * The Ethereum main network.
   */
  ETH = "ETH",

  /**
   * The Solana network.
   */
  SOL = "SOL",

  /**
   * The TRON network.
   */
  TRX = "TRX",
}

export enum ChainType {
  EVM = "EVM",
  SOLANA = "SOLANA",
  TRX = "TRX",
}

export const chainProperties: Record<string, BasicChainProperties> = {
  [ChainSymbol.GRL]: {
    chainSymbol: ChainSymbol.GRL,
    chainId: "0x5",
    name: "Goerli",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.BSC]: {
    chainSymbol: ChainSymbol.BSC,
    chainId: "0x38",
    name: "BNB Chain",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.ETH]: {
    chainSymbol: ChainSymbol.ETH,
    chainId: "0x1",
    name: "Ethereum",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.SOL]: {
    chainSymbol: ChainSymbol.SOL,
    name: "Solana",
    chainType: ChainType.SOLANA,
  },
  [ChainSymbol.TRX]: {
    chainSymbol: ChainSymbol.TRX,
    name: "Tron",
    chainType: ChainType.TRX,
  },
};
