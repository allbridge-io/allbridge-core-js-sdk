import { ChainDetails, TokenInfoWithChainDetails } from "./tokens-info.model";

export function mapChainDetailsToTokenInfoList(
  chainDetails: ChainDetails
): TokenInfoWithChainDetails[] {
  const {
    tokens: _tokens,
    name: chainName,
    ...chainDetailsWithoutTokensAndName
  } = chainDetails;
  return chainDetails.tokens.map((tokenInfo) => {
    return {
      ...tokenInfo,
      ...chainDetailsWithoutTokensAndName,
      chainName,
    };
  });
}
