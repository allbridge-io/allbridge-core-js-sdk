import { TestnetChainSymbol } from "../../chains";
import { ChainDetailsMap, TokenWithChainDetails, TokensInfo } from "../../tokens-info";
import tokensGroupedByChain from "../data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGRL from "../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetails from "../data/tokens-info/TokenInfoWithChainDetails.json";

const expectedTokenInfoWithChainDetails = tokenInfoWithChainDetails as unknown as TokenWithChainDetails[];
const expectedTokenInfoWithChainDetailsGRL = tokenInfoWithChainDetailsGRL as unknown as TokenWithChainDetails[];
const chainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;

describe("TokensInfo", () => {
  const tokensInfo = new TokensInfo(chainDetailsMap);

  it("☀️ chainDetailsMap() returns ChainDetailsMap", () => {
    expect(tokensInfo.chainDetailsMap()).toEqual(chainDetailsMap);
  });

  it("☀️ tokens() returns a list of TokenWithChainDetails", () => {
    expect(tokensInfo.tokens()).toEqual(expectedTokenInfoWithChainDetails);
  });

  it("☀️ tokensByChain(GRL) returns a list of TokenWithChainDetails on Goerli chain", () => {
    expect(tokensInfo.tokensByChain(TestnetChainSymbol.GRL)).toEqual(expectedTokenInfoWithChainDetailsGRL);
  });
});
