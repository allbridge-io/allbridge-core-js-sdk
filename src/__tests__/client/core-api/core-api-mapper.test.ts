import { mapChainDetailsResponseToChainDetailsMap } from "../../../client/core-api/core-api-mapper";
import { ChainDetailsResponse } from "../../../client/core-api/core-api.model";
import { ChainDetailsWithTokens, ChainDetailsMapWithFlags } from "../../../tokens-info";
import chainDetailsGRL from "../../data/tokens-info/ChainDetails-GRL.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMapWithFlags.json";
import tokensInfo from "../../mock/core-api/token-info.json";
import { initChainsWithTestnet } from "../../mock/utils";

const expectedTokensGroupedByChain = tokensGroupedByChain as unknown as ChainDetailsMapWithFlags;

initChainsWithTestnet();

describe("Core API Mapper", () => {
  describe("given ChainDetailsMapDTO", () => {
    const dto: ChainDetailsResponse = tokensInfo as unknown as ChainDetailsResponse;

    describe("mapChainDetailsMapFromDTO", () => {
      it("returns ChainDetailsMap object", () => {
        const actual = mapChainDetailsResponseToChainDetailsMap(dto);
        expect(actual).toEqual(expectedTokensGroupedByChain);
      });
    });
  });

  describe("given ChainDetailsMapDTO with unknown chain", () => {
    describe("mapChainDetailsMapFromDTO", () => {
      it("returns empty ChainDetailsMap object", () => {
        const chainDetails = chainDetailsGRL as unknown as ChainDetailsWithTokens;
        const dto = {
          UNKNOWN: chainDetails,
        } as unknown as ChainDetailsResponse;
        const actual = mapChainDetailsResponseToChainDetailsMap(dto);
        expect(actual).toEqual({});
      });
    });
  });
});
