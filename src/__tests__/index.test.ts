import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { AllbridgeCoreSdk } from "../index";
import { TokenInfoWithChainDetails, TokensInfoEntries } from "../tokens-info";
import tokenInfoWithChainDetails from "./data/token-info-with-chain-details.json";
import tokensGroupedByChain from "./data/tokens-grouped-by-chain.json";
import tokenInfoResponse from "./mock/api/token-info.json";

const expectedTokenInfoWithChainDetails =
  tokenInfoWithChainDetails as unknown as TokenInfoWithChainDetails[];
const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as TokensInfoEntries;

describe("TokenInfo", () => {
  let sdk: AllbridgeCoreSdk;

  beforeEach(() => {
    sdk = new AllbridgeCoreSdk({ apiUrl: "http://localhost" });
  });

  describe("given /tokenInfo endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost")
        .get("/token-info")
        .reply(200, tokenInfoResponse);
    });

    describe("when called", () => {
      it("tokens() returns TokensInfoEntries", async () => {
        const tokensInfo = await sdk.getTokensInfo();
        expect(tokensInfo.tokens()).toEqual(expectedTokensGroupedByChain);
        scope.done();
      });

      it("tokens(false) returns a list of TokenInfoWithChainDetails", async () => {
        const tokensInfo = await sdk.getTokensInfo();
        expect(tokensInfo.tokens(false)).toEqual(
          expectedTokenInfoWithChainDetails
        );
        scope.done();
      });
    });
  });
});
