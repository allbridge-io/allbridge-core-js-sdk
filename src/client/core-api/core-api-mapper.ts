import { Chains } from "../../chains";
import { ChainSymbol } from "../../chains/chain.enums";
import {
  AbrPayerAvailability,
  ChainDetails,
  ChainDetailsMap,
  ChainDetailsMapWithFlags,
  ChainDetailsWithTokensWithFlags,
  MessengerTransferTime,
  PoolInfoMap,
  PoolKeyObject,
  TokenWithChainDetailsWithFlags,
  TransferTime,
} from "../../tokens-info";
import { calculatePoolInfoImbalance } from "../../utils/calculation";
import {
  AbrPayerAvailabilityKeyDTO,
  AbrPayerAvailabilityTypeDTO,
  ChainDetailsDTO,
  ChainDetailsResponse,
  Messenger,
  MessengerKeyDTO,
  MessengerTransferTimeDTO,
  PoolInfoResponse,
  TokenDTO,
  TransferTimeDTO,
} from "./core-api.model";

export function mapChainDetailsResponseToChainDetailsMap(response: ChainDetailsResponse): ChainDetailsMapWithFlags {
  return Object.entries(response).reduce<ChainDetailsMapWithFlags>((map, entry) => {
    const chainSymbol = entry[0];
    const chainDetailsDTO = entry[1];
    const chainDetails = mapChainDetailsFromDto(chainSymbol, chainDetailsDTO);
    if (chainDetails) {
      map[chainSymbol] = chainDetails;
    }
    return map;
  }, {});
}

/**
 * @deprecated Do not use.
 * The current Core API does not serve pool data, so the result is empty for it.
 */
export function mapChainDetailsResponseToPoolInfoMap(response: ChainDetailsResponse): PoolInfoMap {
  const poolInfoMap: PoolInfoMap = {};
  for (const [chainSymbolValue, chainDetailsDTO] of Object.entries(response)) {
    const chainSymbol = chainSymbolValue;
    for (const token of chainDetailsDTO.tokens) {
      const { poolAddress, poolInfo } = token;
      if (!poolAddress || !poolInfo) {
        continue;
      }
      const poolKey = mapPoolKeyObjectToPoolKey({ chainSymbol, poolAddress });
      const imbalance = calculatePoolInfoImbalance(poolInfo);
      poolInfoMap[poolKey] = { ...poolInfo, imbalance };
    }
  }
  return poolInfoMap;
}

/**
 * Flags assumed for tokens served without them: the current Core API returns every token as a token to send
 * and has no liquidity pools.
 */
const DEFAULT_TOKEN_FLAGS: TokenWithChainDetailsWithFlags["flags"] = { swap: true, pool: false };

function mapTokenWithChainDetailsFromDto(chainDetails: ChainDetails, dto: TokenDTO): TokenWithChainDetailsWithFlags {
  const { name: chainName, ...chainDetailsWithoutName } = chainDetails;
  const { poolInfo: _poolInfo, flags, ...dtoWithoutPoolInfo } = dto;
  // The deprecated pool-era token fields (poolAddress, feeShare, apr, lpRate, ...) are kept on the public type
  // for backward compatibility but are undefined when served by the current Core API.
  return {
    ...dtoWithoutPoolInfo,
    ...chainDetailsWithoutName,
    chainName,
    flags: flags ?? { ...DEFAULT_TOKEN_FLAGS },
  } as TokenWithChainDetailsWithFlags;
}

function mapMessengerKeyDtoToMessenger(dto: MessengerKeyDTO): Messenger | null {
  switch (dto) {
    case MessengerKeyDTO.ALLBRIDGE:
      return Messenger.ALLBRIDGE;
    case MessengerKeyDTO.WORMHOLE:
      return Messenger.WORMHOLE;
    case MessengerKeyDTO.CCTP:
      return Messenger.CCTP;
    case MessengerKeyDTO.CCTP_V2:
      return Messenger.CCTP_V2;
    case MessengerKeyDTO.OFT:
      return Messenger.OFT;
    case MessengerKeyDTO.X_RESERVE:
      return Messenger.X_RESERVE;
  }
}

function mapTransferTimeFromDto(dto: TransferTimeDTO): TransferTime {
  return Object.entries(dto).reduce<TransferTime>((result, [key, value]) => {
    result[key as ChainSymbol] = mapMessengerTransferTimeFromDto(value);
    return result;
  }, {});
}

function mapMessengerTransferTimeFromDto(dto: MessengerTransferTimeDTO): MessengerTransferTime {
  return Object.entries(dto).reduce<MessengerTransferTime>((messengerTransferTime, [key, value]) => {
    const messenger = mapMessengerKeyDtoToMessenger(key as MessengerKeyDTO);
    if (messenger && value != null) {
      messengerTransferTime[messenger] = value;
    }
    return messengerTransferTime;
  }, {});
}

function mapChainDetailsFromDto(chainSymbol: string, dto: ChainDetailsDTO): ChainDetailsWithTokensWithFlags | null {
  const basicChainProperties = Chains.getChainsProperties()[chainSymbol];
  if (!basicChainProperties) {
    return null;
  }
  // bridgeAddress is deprecated and undefined when served by the current Core API; the public type keeps it
  // for backward compatibility.
  const chainDetails = {
    ...basicChainProperties,
    allbridgeChainId: dto.chainId,
    bridgeId: dto.bridgeId,
    paddingUtilId: dto.paddingUtilId,
    bridgeAddress: dto.bridgeAddress,
    oftBridgeAddress: dto.oftBridgeAddress,
    yieldAddress: dto.yieldAddress,
    abrPayer: dto.abrPayer
      ? {
          payerAddress: dto.abrPayer.payerAddress,
          abrToken: {
            chainSymbol: chainSymbol as ChainSymbol,
            tokenAddress: dto.abrPayer.tokenAddress,
            decimals: dto.abrPayer.tokenDecimals,
          },
          payerAvailability: mapAbrPayerAvailabilityFromDto(dto.abrPayer.payerAvailability),
        }
      : undefined,
    transferTime: mapTransferTimeFromDto(dto.transferTime),
    txCostAmount: dto.txCostAmount,
    confirmations: dto.confirmations,
    suiAddresses: dto.suiAddresses,
  } as ChainDetails;
  return {
    ...chainDetails,
    tokens: dto.tokens.map((tokenDto) => mapTokenWithChainDetailsFromDto(chainDetails, tokenDto)),
  };
}

function mapAbrPayerAvailabilityFromDto(dto: AbrPayerAvailabilityTypeDTO): AbrPayerAvailability {
  if (!dto) return {};
  const out: AbrPayerAvailability = {};

  for (const [dtoKey, isAvailable] of Object.entries(dto) as [AbrPayerAvailabilityKeyDTO, boolean][]) {
    if (!isAvailable) continue;

    const messengerEnumValue = dtoKeyToMessenger[dtoKey];
    if (!messengerEnumValue) continue;

    out[messengerEnumValue] = true;
  }

  return out;
}

// Build mapping from dto key ("allbridge") to Messenger enum value (1..5)
const dtoKeyToMessenger: Record<AbrPayerAvailabilityKeyDTO, Messenger> = Object.fromEntries(
  Object.entries(MessengerKeyDTO).map(([enumKey, dtoKey]) => {
    // enumKey: "ALLBRIDGE"
    // dtoKey:  "allbridge"
    return [dtoKey, Messenger[enumKey as keyof typeof Messenger]];
  })
) as Record<AbrPayerAvailabilityKeyDTO, Messenger>;

/**
 * @deprecated Do not use.
 */
export function mapPoolKeyToPoolKeyObject(poolKey: string): PoolKeyObject {
  const dividerPosition = poolKey.indexOf("_");
  return {
    chainSymbol: poolKey.substring(0, dividerPosition),
    poolAddress: poolKey.substring(dividerPosition + 1),
  };
}

/**
 * @deprecated Do not use.
 */
export function mapPoolKeyObjectToPoolKey(poolKeyObject: PoolKeyObject): string {
  return poolKeyObject.chainSymbol + "_" + poolKeyObject.poolAddress;
}

/**
 * @deprecated Do not use.
 */
export function mapChainDetailsMapToPoolKeyObjects(chainDetailsMap: ChainDetailsMap): PoolKeyObject[] {
  const result = [];
  for (const [chainSymbolValue, chainDetails] of Object.entries(chainDetailsMap)) {
    const chainSymbol = chainSymbolValue;
    for (const token of chainDetails.tokens) {
      result.push({
        chainSymbol,
        poolAddress: token.poolAddress,
      });
    }
  }
  return result;
}

/**
 * @deprecated Do not use.
 */
export function mapPoolInfoResponseToPoolInfoMap(responseBody: PoolInfoResponse): PoolInfoMap {
  const poolInfoMap: PoolInfoMap = {};
  for (const [chainSymbolValue, poolInfoByAddress] of Object.entries(responseBody)) {
    const chainSymbol = chainSymbolValue;
    for (const [poolAddress, poolInfo] of Object.entries(poolInfoByAddress)) {
      poolInfo.imbalance = calculatePoolInfoImbalance(poolInfo);
      poolInfoMap[mapPoolKeyObjectToPoolKey({ chainSymbol, poolAddress })] = poolInfo;
    }
  }
  return poolInfoMap;
}
