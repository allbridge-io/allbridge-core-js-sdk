import { describe, expect, it } from "vitest";
import { mapChainDetailsMapFromDTO } from "../../../client/core-api/core-api-mapper";
import { ChainDetailsMapDTO } from "../../../client/core-api/core-api.model";
import { ChainDetails, ChainDetailsMap } from "../../../tokens-info";
import chainDetailsGRL from "../../data/tokens-info/ChainDetails-GRL.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";
import tokensInfo from "../../mock/core-api/token-info.json";

const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;

describe("Core API Mapper", () => {
  describe("given ChainDetailsMapDTO", () => {
    const dto: ChainDetailsMapDTO = tokensInfo as unknown as ChainDetailsMapDTO;

    describe("mapChainDetailsMapFromDTO", () => {
      it("returns ChainDetailsMap object", () => {
        const actual = mapChainDetailsMapFromDTO(dto);
        expect(actual).toEqual(expectedTokensGroupedByChain);
      });
    });
  });

  describe("given ChainDetailsMapDTO with unknown chain", () => {
    describe("mapChainDetailsMapFromDTO", () => {
      it("returns empty ChainDetailsMap object", () => {
        const chainDetails = chainDetailsGRL as unknown as ChainDetails;
        const dto = { UNKNOWN: chainDetails } as unknown as ChainDetailsMapDTO;
        const actual = mapChainDetailsMapFromDTO(dto);
        expect(actual).toEqual({});
      });
    });
  });
});
