import { ChainSymbol } from "../chains";
import { mapChainDetailsToTokenInfoList } from "./tokens-info-mapper";
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
    return Object.values(this._map).flatMap((chainDetails) =>
      mapChainDetailsToTokenInfoList(chainDetails)
    );
  }

  tokensByChain(chainSymbol: ChainSymbol): TokenInfoWithChainDetails[] {
    return mapChainDetailsToTokenInfoList(this._map[chainSymbol]);
  }
}
