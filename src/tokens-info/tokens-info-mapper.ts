import { chainProperties } from "../chains";
import {
  ChainDetailsDTO,
  ChainDetailsMapDTO,
  TokenDTO,
} from "../dto/api.model";
import {
  ChainDetails,
  TokenInfo,
  ChainDetailsMap,
  TokenInfoWithChainDetails,
} from "./tokens-info.model";

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

export function mapChainDetailsMapFromDTO(
  dto: ChainDetailsMapDTO
): ChainDetailsMap {
  return Object.entries(dto).reduce<ChainDetailsMap>((map, entry) => {
    const chainDetails = mapChainDetailsFromDto(...entry);
    if (chainDetails) {
      map[entry[0]] = chainDetails;
    }
    return map;
  }, {});
}

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
