import { ChainType } from "./chain.enums";

/**
 * Contains blockchain's basic information
 */
export interface BasicChainProperties {
  /**
   * The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   */
  chainSymbol: string;
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
   * Blockchain type. For more details, see: {@link ChainType}.
   */
  chainType: ChainType;
}
export interface AdditionalBasicChainProperties extends Omit<BasicChainProperties, "chainSymbol"> {
  /**
   * The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   */
  chainSymbol: string;
}
