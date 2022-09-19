import { describe, expect, it } from "vitest";
import { ChainDetailsMapDTO } from "../dto/api.model";
import { mapTokensInfoFromDTO } from "../tokens-info-mapper";
import tokensInfo from "./mock/api/token-info.json";

describe("TokensInfo Mapper", () => {
  describe("given ChainDetailsMapDTO", () => {
    const dto: ChainDetailsMapDTO = tokensInfo as unknown as ChainDetailsMapDTO;

    describe("tokensInfoFromDTO", () => {
      it("returns TokensInfo object", () => {
        const tokensInfo = mapTokensInfoFromDTO(dto);
        expect(tokensInfo).not.toBeNull();
      });
    });
  });
});
