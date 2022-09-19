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
): ChainDetails {
  return {
    chainId: dto.chainId,
    bridgeAddress: dto.bridgeAddress,
    txTime: dto.txTime,
    confirmations: dto.confirmations,
    tokens: dto.tokens.map((dto) => mapTokenInfoFromDto(dto)),
  };
}

export const mapTokensInfoFromDTO = (dto: ChainDetailsMapDTO): TokensInfo => {
  return new TokensInfo(
    Object.entries(dto).reduce<TokensInfoEntries>((entries, entry) => {
      entries[entry[0]] = mapChainDetailsFromDto(...entry);
      return entries;
    }, {})
  );
};
