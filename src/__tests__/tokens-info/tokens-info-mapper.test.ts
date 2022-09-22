import { describe, expect, it } from "vitest";
import { ChainDetailsMapDTO } from "../../dto/api.model";
import {
  ChainDetails,
  ChainDetailsMap,
  mapChainDetailsMapFromDTO,
  mapChainDetailsToTokenInfoList,
  TokenInfoWithChainDetails,
} from "../../tokens-info";
import chainDetailsGRL from "../data/tokens-info/ChainDetails-GRL.json";
import tokensGroupedByChain from "../data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGRL from "../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokensInfo from "../mock/api/token-info.json";
const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;
const expectedTokenInfoWithChainDetailsGRL =
  tokenInfoWithChainDetailsGRL as unknown as TokenInfoWithChainDetails[];

describe("TokensInfo Mapper", () => {
  describe("given ChainDetailsMapDTO", () => {
    const dto: ChainDetailsMapDTO = tokensInfo as unknown as ChainDetailsMapDTO;

    describe("mapChainDetailsMapFromDTO", () => {
      it("returns ChainDetailsMap object", () => {
        const actual = mapChainDetailsMapFromDTO(dto);
        expect(actual).toEqual(expectedTokensGroupedByChain);
      });
    });
  });
  describe("given ChainDetails", () => {
    const chainDetails = chainDetailsGRL as unknown as ChainDetails;

    describe("mapChainDetailsToTokenInfoList", () => {
      it("returns a list of TokenInfoWithChainDetails", () => {
        const actual = mapChainDetailsToTokenInfoList(chainDetails);
        expect(actual).toEqual(expectedTokenInfoWithChainDetailsGRL);
      });
    });
  });
});
