import { BasicChainProperties } from "./models";

export * from "./models";

export enum ChainSymbol {
  /**
   * The Goerli testnet.
   */
  GRL = "GRL",

  /**
   * The Sepolia testnet.
   */
  SPL = "SPL",

  /**
   * The Holešky testnet.
   */
  HOL = "HOL",

  /**
   * The BNB Smart Chain main network.
   */
  BSC = "BSC",

  /**
   * The Ethereum main network.
   */
  ETH = "ETH",

  /**
   * The Base main network.
   */
  BAS = "BAS",

  /**
   * The Solana network.
   */
  SOL = "SOL",

  /**
   * The TRON network.
   */
  TRX = "TRX",

  /**
   * The Polygon network.
   */
  POL = "POL",

  /**
   * The Polygon Mumbai testnet.
   */
  MUM = "MUM",

  /**
   * The Polygon Amoy testnet.
   */
  AMO = "AMO",

  /**
   * The Arbitrum network.
   */
  ARB = "ARB",

  /**
   * The Celo network.
   */
  CEL = "CEL",

  /**
   * The Avalanche main network.
   */
  AVA = "AVA",

  /**
   * The Soroban network.
   */
  SRB = "SRB",

  /**
   * The Stellar network.
   */
  STLR = "STLR",

  /**
   * The OP Mainnet network.
   */
  OPT = "OPT",
}

export enum ChainType {
  EVM = "EVM",
  SOLANA = "SOLANA",
  TRX = "TRX",
  SRB = "SRB",
}

/**
 * Native gas tokens decimals by ChainType
 */
export const ChainDecimalsByType: Record<ChainType, number> = {
  EVM: 18,
  SOLANA: 9,
  TRX: 6,
  SRB: 7,
};

export const chainProperties: Record<string, BasicChainProperties> = {
  [ChainSymbol.GRL]: {
    chainSymbol: ChainSymbol.GRL,
    chainId: "0x5",
    name: "Goerli",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.SPL]: {
    chainSymbol: ChainSymbol.SPL,
    chainId: "0xaa36a7",
    name: "Sepolia",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.HOL]: {
    chainSymbol: ChainSymbol.HOL,
    chainId: "0x4268",
    name: "Holešky",
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
  [ChainSymbol.BAS]: {
    chainSymbol: ChainSymbol.BAS,
    chainId: "0x2105",
    name: "Base",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.ARB]: {
    chainSymbol: ChainSymbol.ARB,
    chainId: "0xa4b1",
    name: "Arbitrum",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.AVA]: {
    chainSymbol: ChainSymbol.AVA,
    chainId: "0xa86a",
    name: "Avalanche",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.CEL]: {
    chainSymbol: ChainSymbol.CEL,
    chainId: "0xa4ec",
    name: "Celo",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.POL]: {
    chainSymbol: ChainSymbol.POL,
    chainId: "0x89",
    name: "Polygon",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.MUM]: {
    chainSymbol: ChainSymbol.MUM,
    chainId: "0x13881",
    name: "Mumbai",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.AMO]: {
    chainSymbol: ChainSymbol.AMO,
    chainId: "0x13882",
    name: "Amoy",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.OPT]: {
    chainSymbol: ChainSymbol.OPT,
    chainId: "0xa",
    name: "OP Mainnet",
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
  [ChainSymbol.SRB]: {
    chainSymbol: ChainSymbol.SRB,
    name: "Stellar",
    chainType: ChainType.SRB,
  },
  [ChainSymbol.STLR]: {
    chainSymbol: ChainSymbol.STLR,
    name: "Stellar",
    chainType: ChainType.SRB,
  },
};
