import { chainProperties } from "../../chains";
import {
  ChainDetailsWithTokens,
  ChainDetailsMap,
  TokenInfoWithChainDetails,
  ChainDetails,
} from "../../tokens-info";
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

function mapTokenInfoWithChainDetailsFromDto(
  chainDetails: ChainDetails,
  dto: TokenDTO
): TokenInfoWithChainDetails {
  const { name: chainName, ...chainDetailsWithoutName } = chainDetails;
  return {
    ...dto,
    ...chainDetailsWithoutName,
    chainName,
  };
}

function mapChainDetailsFromDto(
  chainSymbol: string,
  dto: ChainDetailsDTO
): ChainDetailsWithTokens | null {
  const basicChainProperties = chainProperties[chainSymbol];
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  if (!basicChainProperties) {
    return null;
  }
  const chainDetails: ChainDetails = {
    ...basicChainProperties,
    allbridgeChainId: dto.chainId,
    bridgeAddress: dto.bridgeAddress,
    txTime: dto.txTime,
    confirmations: dto.confirmations,
  };
  return {
    ...chainDetails,
    tokens: dto.tokens.map((tokenDto) =>
      mapTokenInfoWithChainDetailsFromDto(chainDetails, tokenDto)
    ),
  };
}
