import { chainProperties } from "../../chains";
import { ChainDetails, ChainDetailsMap, TokenInfo } from "../../tokens-info";
import {
  ChainDetailsDTO,
  ChainDetailsMapDTO,
  TokenDTO,
} from "./core-api.model";

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
