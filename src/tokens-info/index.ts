import {
  ChainDetailsMap,
  TokenInfoWithChainDetails,
} from "./tokens-info.model";

export * from "./tokens-info.model";
export * from "./tokens-info-mapper";

export class TokensInfo {
  private readonly _map: ChainDetailsMap;

  constructor(map: ChainDetailsMap) {
    this._map = map;
  }

  chainDetailsMap(): ChainDetailsMap {
    return this._map;
  }

  tokens(): TokenInfoWithChainDetails[] {
    return Object.values(this._map).flatMap((chainDetails) => {
      const {
        tokens: _tokens,
        name: chainName,
        ...chainDetailsWithoutTokensAndName
      } = chainDetails;
      return chainDetails.tokens.map((tokenInfo) => {
        return {
          ...tokenInfo,
          ...chainDetailsWithoutTokensAndName,
          chainName,
        };
      });
    });
  }
}
