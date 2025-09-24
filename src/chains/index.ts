import { SdkError } from "../exceptions";
import { ChainSymbol, ChainType } from "./chain.enums";
import { BasicChainProperties } from "./models";

/**
 * Native gas tokens decimals by ChainType
 */
const chainDecimalsByType: Record<ChainType, number> = {
  EVM: 18,
  SOLANA: 9,
  TRX: 6,
  SRB: 7,
  SUI: 9,
  ALG: 6,
};

const defaultProperties: Record<string, BasicChainProperties> = {
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
  [ChainSymbol.OPT]: {
    chainSymbol: ChainSymbol.OPT,
    chainId: "0xa",
    name: "OP Mainnet",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.SNC]: {
    chainSymbol: ChainSymbol.SNC,
    chainId: "0x92",
    name: "Sonic",
    chainType: ChainType.EVM,
  },
  [ChainSymbol.UNI]: {
    chainSymbol: ChainSymbol.UNI,
    chainId: "0x82",
    name: "Unichain",
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
  [ChainSymbol.SUI]: {
    chainSymbol: ChainSymbol.SUI,
    name: "Sui",
    chainType: ChainType.SUI,
  },
  [ChainSymbol.ALG]: {
    chainSymbol: ChainSymbol.ALG,
    name: "Algorand",
    chainType: ChainType.ALG,
  },
};

export const Chains = (() => {
  let chainProperties: Record<string, BasicChainProperties> = { ...defaultProperties };

  return {
    addChainsProperties(additionalProperties?: Record<string, BasicChainProperties>) {
      chainProperties = { ...chainProperties, ...additionalProperties };
    },

    getChainProperty(chainSymbol: string): BasicChainProperties {
      const property = chainProperties[chainSymbol];
      if (!property) {
        throw new SdkError(`Cannot find chain properties for ${chainSymbol}`);
      }
      return property;
    },

    getChainsProperties(): Record<string, BasicChainProperties> {
      return chainProperties;
    },

    getChainDecimalsByType(chainType: ChainType): number {
      return chainDecimalsByType[chainType];
    },
  };
})();
