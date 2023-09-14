import { ChainSymbolType, ChainType } from "./index";

export interface BasicChainProperties {
  chainSymbol: ChainSymbolType;
  chainId?: string; // A 0x-prefixed hexadecimal string
  name: string;
  chainType: ChainType;
}
