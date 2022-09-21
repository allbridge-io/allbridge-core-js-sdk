import { describe, expect, it } from "vitest";
import { ChainDetailsMapDTO } from "../dto/api.model";
import { TokensInfoEntries } from "../tokens-info";
import { mapTokensInfoEntriesFromDTO } from "../tokens-info-mapper";
import tokensGroupedByChain from "./data/tokens-grouped-by-chain.json";
import tokensInfo from "./mock/api/token-info.json";
const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as TokensInfoEntries;

describe("TokensInfo Mapper", () => {
  describe("given ChainDetailsMapDTO", () => {
    const dto: ChainDetailsMapDTO = tokensInfo as unknown as ChainDetailsMapDTO;

    describe("mapTokensInfoEntriesFromDTO", () => {
      it("returns TokensInfoEntries object", () => {
        const tokensInfoEntries = mapTokensInfoEntriesFromDTO(dto);
        expect(tokensInfoEntries).toEqual(expectedTokensGroupedByChain);
      });
    });
  });
});
