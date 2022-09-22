import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { ChainSymbol } from "../chains";
import { AllbridgeCoreSdk } from "../index";
import { ChainDetailsMap, TokenInfoWithChainDetails } from "../tokens-info";
import tokensGroupedByChain from "./data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGRL from "./data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetails from "./data/tokens-info/TokenInfoWithChainDetails.json";
import tokenInfoResponse from "./mock/api/token-info.json";

const expectedTokenInfoWithChainDetails =
  tokenInfoWithChainDetails as unknown as TokenInfoWithChainDetails[];
const expectedTokenInfoWithChainDetailsGRL =
  tokenInfoWithChainDetailsGRL as unknown as TokenInfoWithChainDetails[];
const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;

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
      it("chainDetailsMap() returns ChainDetailsMap", async () => {
        const tokensInfo = await sdk.getTokensInfo();
        expect(tokensInfo.chainDetailsMap()).toEqual(
          expectedTokensGroupedByChain
        );
        scope.done();
      });

      it("tokens() returns a list of TokenInfoWithChainDetails", async () => {
        const tokensInfo = await sdk.getTokensInfo();
        expect(tokensInfo.tokens()).toEqual(expectedTokenInfoWithChainDetails);
        scope.done();
      });

      it("tokensByChain(GRL) returns a list of TokenInfoWithChainDetails on Goerli chain", async () => {
        const tokensInfo = await sdk.getTokensInfo();
        expect(tokensInfo.tokensByChain(ChainSymbol.GRL)).toEqual(
          expectedTokenInfoWithChainDetailsGRL
        );
        scope.done();
      });
    });
  });
});
