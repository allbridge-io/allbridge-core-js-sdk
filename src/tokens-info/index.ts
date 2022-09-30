import { ChainSymbol } from "../chains";
import {
  ChainDetailsMap,
  TokenInfoWithChainDetails,
} from "./tokens-info.model";

export * from "./tokens-info.model";

export class TokensInfo {
  private readonly _map: ChainDetailsMap;

  constructor(map: ChainDetailsMap) {
    this._map = map;
  }

  chainDetailsMap(): ChainDetailsMap {
    return this._map;
  }

  tokens(): TokenInfoWithChainDetails[] {
    return Object.values(this._map).flatMap(
      (chainDetails) => chainDetails.tokens
    );
  }

  tokensByChain(chainSymbol: ChainSymbol): TokenInfoWithChainDetails[] {
    return this._map[chainSymbol].tokens;
  }
}
