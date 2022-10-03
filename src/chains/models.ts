import { ChainType } from "./index";

export interface BasicChainProperties {
  chainSymbol: string;
  chainId?: string; // A 0x-prefixed hexadecimal string
  name: string;
  chainType: ChainType;
}
