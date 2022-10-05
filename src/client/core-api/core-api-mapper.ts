import { chainProperties } from "../../chains";
import {
  ChainDetails,
  ChainDetailsMap,
  ChainDetailsWithTokens,
  TokenInfoWithChainDetails,
  TxTime,
} from "../../tokens-info";
import {
  ChainDetailsDTO,
  ChainDetailsMapDTO,
  Messenger,
  MessengerKeyDTO,
  TokenDTO,
  TxTimeDTO,
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

function mapMessengerKeyDtoToMessenger(dto: MessengerKeyDTO): Messenger | null {
  switch (dto) {
    case MessengerKeyDTO.ALLBRIDGE:
      return Messenger.ALLBRIDGE;
    case MessengerKeyDTO.WORMHOLE:
      return Messenger.WORMHOLE;
    default:
      return null;
  }
}

function mapTxTimeFromDto(dto: TxTimeDTO): TxTime {
  return Object.entries(dto).reduce<TxTime>((result, [key, value]) => {
    const messenger = mapMessengerKeyDtoToMessenger(key as MessengerKeyDTO);
    if (messenger) {
      result[messenger] = value;
    }
    return result;
  }, {});
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
    txTime: mapTxTimeFromDto(dto.txTime),
    confirmations: dto.confirmations,
  };
  return {
    ...chainDetails,
    tokens: dto.tokens.map((tokenDto) =>
      mapTokenInfoWithChainDetailsFromDto(chainDetails, tokenDto)
    ),
  };
}
