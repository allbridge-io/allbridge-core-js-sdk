import { chainProperties } from "./chains";
import { ChainDetailsDTO, ChainDetailsMapDTO, TokenDTO } from "./dto/api.model";
import {
  ChainDetails,
  TokenInfo,
  TokensInfo,
  TokensInfoEntries,
} from "./tokens-info";

function mapTokenInfoFromDto(dto: TokenDTO): TokenInfo {
  return { ...dto };
}

function mapChainDetailsFromDto(
  chainSymbol: string,
  dto: ChainDetailsDTO
): ChainDetails | null {
  const basicChainProperties = chainProperties[chainSymbol];
  if (!basicChainProperties) {
    return null;
  }
  return {
    ...basicChainProperties,
    allbridgeChainId: dto.chainId,
    bridgeAddress: dto.bridgeAddress,
    txTime: dto.txTime,
    confirmations: dto.confirmations,
    tokens: dto.tokens.map((dto) => mapTokenInfoFromDto(dto)),
  };
}

export const mapTokensInfoEntriesFromDTO = (
  dto: ChainDetailsMapDTO
): TokensInfoEntries => {
  return Object.entries(dto).reduce<TokensInfoEntries>((entries, entry) => {
    const chainDetails = mapChainDetailsFromDto(...entry);
    if (chainDetails) {
      entries[entry[0]] = chainDetails;
    }
    return entries;
  }, {});
};
