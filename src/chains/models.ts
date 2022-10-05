import { ChainSymbol, ChainType } from "./index";

export interface BasicChainProperties {
  chainSymbol: ChainSymbol;
  chainId?: string; // A 0x-prefixed hexadecimal string
  name: string;
  chainType: ChainType;
}
