import { chainProperties, ChainSymbol } from "../../chains";
import {
  ChainDetails,
  ChainDetailsMap,
  ChainDetailsWithTokens,
  PoolInfoMap,
  PoolKeyObject,
  TokenInfoWithChainDetails,
  TxTime,
} from "../../tokens-info";
import {
  ChainDetailsDTO,
  ChainDetailsResponse,
  Messenger,
  MessengerKeyDTO,
  PoolInfoResponse,
  TokenDTO,
  TxTimeDTO,
} from "./core-api.model";

export function mapChainDetailsResponseToChainDetailsMap(
  response: ChainDetailsResponse
): ChainDetailsMap {
  return Object.entries(response).reduce<ChainDetailsMap>((map, entry) => {
    const chainSymbol = entry[0];
    const chainDetailsDTO = entry[1];
    const chainDetails = mapChainDetailsFromDto(chainSymbol, chainDetailsDTO);
    if (chainDetails) {
      map[chainSymbol] = chainDetails;
    }
    return map;
  }, {});
}

export function mapChainDetailsResponseToPoolInfoMap(
  response: ChainDetailsResponse
): PoolInfoMap {
  const poolInfoMap: PoolInfoMap = {};
  for (const [chainSymbolValue, chainDetailsDTO] of Object.entries(response)) {
    const chainSymbol = chainSymbolValue as ChainSymbol;
    for (const token of chainDetailsDTO.tokens) {
      const poolKey = mapPoolKeyObjectToPoolKey({
        chainSymbol,
        poolAddress: token.poolAddress,
      });
      poolInfoMap[poolKey] = token.poolInfo;
    }
  }
  return poolInfoMap;
}

function mapTokenInfoWithChainDetailsFromDto(
  chainDetails: ChainDetails,
  dto: TokenDTO
): TokenInfoWithChainDetails {
  const { name: chainName, ...chainDetailsWithoutName } = chainDetails;
  const { poolInfo: _poolInfo, ...dtoWithoutPoolInfo } = dto;
  return {
    ...dtoWithoutPoolInfo,
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

export function mapPoolKeyToPoolKeyObject(poolKey: string): PoolKeyObject {
  const dividerPosition = poolKey.indexOf("_");
  return {
    chainSymbol: poolKey.substring(0, dividerPosition) as ChainSymbol,
    poolAddress: poolKey.substring(dividerPosition + 1),
  };
}

export function mapPoolKeyObjectToPoolKey(
  poolKeyObject: PoolKeyObject
): string {
  return poolKeyObject.chainSymbol + "_" + poolKeyObject.poolAddress;
}

export function mapChainDetailsMapToPoolKeyObjects(
  chainDetailsMap: ChainDetailsMap
): PoolKeyObject[] {
  const result = [];
  for (const [chainSymbolValue, chainDetails] of Object.entries(
    chainDetailsMap
  )) {
    const chainSymbol = chainSymbolValue as ChainSymbol;
    for (const token of chainDetails.tokens) {
      result.push({
        chainSymbol,
        poolAddress: token.poolAddress,
      });
    }
  }
  return result;
}

export function mapPoolInfoResponseToPoolInfoMap(
  responseBody: PoolInfoResponse
): PoolInfoMap {
  const poolInfoMap: PoolInfoMap = {};
  for (const [chainSymbolValue, poolInfoByAddress] of Object.entries(
    responseBody
  )) {
    const chainSymbol = chainSymbolValue as ChainSymbol;
    for (const [poolAddress, poolInfo] of Object.entries(poolInfoByAddress)) {
      poolInfoMap[mapPoolKeyObjectToPoolKey({ chainSymbol, poolAddress })] =
        poolInfo;
    }
  }
  return poolInfoMap;
}
