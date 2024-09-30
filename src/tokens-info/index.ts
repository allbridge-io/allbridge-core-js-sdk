import { SdkError } from "../exceptions";
import { ChainDetailsMap, TokenWithChainDetails } from "./tokens-info.model";

export * from "./tokens-info.model";

export class TokensInfo {
  /**
   * @internal
   */
  private readonly _map: ChainDetailsMap;

  /**
   * @internal
   * @param map
   */
  constructor(map: ChainDetailsMap) {
    this._map = map;
  }

  /**
   * Returns {@link ChainDetailsMap} containing a list of supported tokens groped by chain.
   */
  chainDetailsMap(): ChainDetailsMap {
    return this._map;
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens}.
   */
  tokens(): TokenWithChainDetails[] {
    return Object.values(this._map).flatMap((chainDetails) => chainDetails.tokens);
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens} on the selected chain.
   */
  tokensByChain(chainSymbol: string): TokenWithChainDetails[] {
    const chainDetails = this._map[chainSymbol];
    if (!chainDetails) {
      throw new SdkError(`Chain details not found for chain symbol: ${chainSymbol}`);
    }
    return chainDetails.tokens;
  }
}
