import { ChainSymbol, ChainType } from "./index";

/**
 * Contains blockchain's basic information
 */
export interface BasicChainProperties {
  /**
   * Blockchain symbol
   */
  chainSymbol: ChainSymbol;
  /**
   * Common Blockchain Id</br>
   * A 0x-prefixed hexadecimal string</br>
   * Optional.
   */
  chainId?: string; // A 0x-prefixed hexadecimal string
  /**
   * Blockchain name
   */
  name: string;
  /**
   * Blockchain type
   */
  chainType: ChainType;
}
