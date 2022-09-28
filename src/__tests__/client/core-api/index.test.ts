import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { ChainDetailsMap } from "../../../tokens-info";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";

const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;

describe("AllbridgeCoreClient", () => {
  const api = new AllbridgeCoreClient({ apiUrl: "http://localhost" });

  describe("given /tokenInfo endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost")
        .get("/token-info")
        .reply(200, tokenInfoResponse);
    });

    describe("when called", () => {
      it("☀️ getTokensInfo() returns TokensInfo", async () => {
        const actual = await api.getTokensInfo();
        expect(actual.chainDetailsMap()).toEqual(expectedTokensGroupedByChain);
        scope.done();
      });
    });
  });
});
