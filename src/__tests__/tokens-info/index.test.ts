import { describe, expect, it } from "vitest";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, TokenInfoWithChainDetails, TokensInfo } from "../../tokens-info";
import tokensGroupedByChain from "../data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGRL from "../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetails from "../data/tokens-info/TokenInfoWithChainDetails.json";

const expectedTokenInfoWithChainDetails = tokenInfoWithChainDetails as unknown as TokenInfoWithChainDetails[];
const expectedTokenInfoWithChainDetailsGRL = tokenInfoWithChainDetailsGRL as unknown as TokenInfoWithChainDetails[];
const chainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;

describe("TokensInfo", () => {
  const tokensInfo = new TokensInfo(chainDetailsMap);

  it("☀️ chainDetailsMap() returns ChainDetailsMap", () => {
    expect(tokensInfo.chainDetailsMap()).toEqual(chainDetailsMap);
  });

  it("☀️ tokens() returns a list of TokenInfoWithChainDetails", () => {
    expect(tokensInfo.tokens()).toEqual(expectedTokenInfoWithChainDetails);
  });

  it("☀️ tokensByChain(GRL) returns a list of TokenInfoWithChainDetails on Goerli chain", () => {
    expect(tokensInfo.tokensByChain(ChainSymbol.GRL)).toEqual(expectedTokenInfoWithChainDetailsGRL);
  });
});
