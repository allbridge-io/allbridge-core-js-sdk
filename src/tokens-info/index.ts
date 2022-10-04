import { ChainSymbol } from "../chains";
import {
  ChainDetailsMap,
  TokenInfoWithChainDetails,
} from "./tokens-info.model";

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
   * Returns a list of supported {@link TokenInfoWithChainDetails | tokens}.
   */
  tokens(): TokenInfoWithChainDetails[] {
    return Object.values(this._map).flatMap(
      (chainDetails) => chainDetails.tokens
    );
  }

  /**
   * Returns a list of supported {@link TokenInfoWithChainDetails | tokens} on the selected chain.
   */
  tokensByChain(chainSymbol: ChainSymbol): TokenInfoWithChainDetails[] {
    return this._map[chainSymbol].tokens;
  }
}
