import {
  mapChainDetailsResponseToChainDetailsMap,
  mapChainDetailsResponseToPoolInfoMap,
} from "../../../client/core-api/core-api-mapper";
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

      it("preserves optional xReserve token config", () => {
        const dtoWithXReserve = JSON.parse(JSON.stringify(dto)) as ChainDetailsResponse;
        const grl = dtoWithXReserve.GRL;
        if (!grl) {
          throw new Error("GRL chain must be defined in test fixture");
        }
        const token = grl.tokens[0];
        if (!token) {
          throw new Error("First GRL token must be defined in test fixture");
        }

        token.xReserve = {
          bridgeAddress: "0x1111111111111111111111111111111111111111",
          feeConst: "0",
          feeShare: "0.01",
        };

        const actual = mapChainDetailsResponseToChainDetailsMap(dtoWithXReserve);
        const mappedToken = actual.GRL?.tokens[0];
        if (!mappedToken) {
          throw new Error("Mapped GRL token must be defined");
        }
        expect(mappedToken.xReserve).toEqual(token.xReserve);
      });
    });
  });

  describe("given ChainDetailsMapDTO without liquidity pools (current Core API)", () => {
    // The current Core API serves neither the pool-era token fields nor the flags and bridgeAddress.
    const dto: ChainDetailsResponse = JSON.parse(JSON.stringify(tokensInfo)) as ChainDetailsResponse;
    for (const chainDetails of Object.values(dto)) {
      delete chainDetails.bridgeAddress;
      for (const token of chainDetails.tokens) {
        delete token.poolAddress;
        delete token.poolInfo;
        delete token.feeShare;
        delete token.apr;
        delete token.lpRate;
        delete token.flags;
      }
    }

    describe("mapChainDetailsMapFromDTO", () => {
      it("maps every token as a token to send", () => {
        const actual = mapChainDetailsResponseToChainDetailsMap(dto);
        const grl = actual.GRL;
        if (!grl) {
          throw new Error("Mapped GRL chain must be defined");
        }
        expect(grl.tokens).toHaveLength(expectedTokensGroupedByChain.GRL?.tokens.length ?? -1);
        for (const token of grl.tokens) {
          expect(token.flags).toEqual({ swap: true, pool: false });
          expect(token.poolAddress).toBeUndefined();
          expect(token.feeShare).toBeUndefined();
          expect(token.bridgeAddress).toBeUndefined();
        }
        expect(grl.bridgeAddress).toBeUndefined();
        expect(grl.tokens[0]?.tokenAddress).toEqual(expectedTokensGroupedByChain.GRL?.tokens[0]?.tokenAddress);
        expect(grl.transferTime).toEqual(expectedTokensGroupedByChain.GRL?.transferTime);
      });
    });

    describe("mapChainDetailsResponseToPoolInfoMap", () => {
      it("returns empty PoolInfoMap", () => {
        expect(mapChainDetailsResponseToPoolInfoMap(dto)).toEqual({});
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
