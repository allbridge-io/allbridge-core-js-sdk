import { describe, expect, it } from "vitest";
import {
  ChainDetails,
  mapChainDetailsToTokenInfoList,
  TokenInfoWithChainDetails,
} from "../../tokens-info";
import chainDetailsGRL from "../data/tokens-info/ChainDetails-GRL.json";
import tokenInfoWithChainDetailsGRL from "../data/tokens-info/TokenInfoWithChainDetails-GRL.json";

const expectedTokenInfoWithChainDetailsGRL =
  tokenInfoWithChainDetailsGRL as unknown as TokenInfoWithChainDetails[];

describe("TokensInfo Mapper", () => {
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
