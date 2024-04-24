import Cache from "timed-cache";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, PoolInfo, PoolInfoMap, PoolKeyObject, TokenWithChainDetails } from "../../tokens-info";
import { mapChainDetailsMapToPoolKeyObjects, mapPoolKeyObjectToPoolKey } from "./core-api-mapper";
import {
  GasBalanceResponse,
  PendingInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClient, AllbridgeCoreClientImpl } from "./index";

const _55_SECONDS_TTL = 55 * 1000;

export class AllbridgeCoreClientPoolInfoCaching implements AllbridgeCoreClient {
  private readonly poolInfoCache;

  constructor(private readonly client: AllbridgeCoreClientImpl) {
    this.poolInfoCache = new PoolInfoCache();
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    const result = await this.client.getChainDetailsMapAndPoolInfoMap();
    return result.chainDetailsMap;
  }
  async tokens(): Promise<TokenWithChainDetails[]> {
    return await this.client.tokens();
  }

  getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return this.client.getTransferStatus(chainSymbol, txId);
  }

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return this.client.getReceiveTransactionCost(args);
  }

  getPendingInfo(): Promise<PendingInfoResponse> {
    return this.client.getPendingInfo();
  }

  getGasBalance(chainSymbol: ChainSymbol, address: string): Promise<GasBalanceResponse> {
    return this.client.getGasBalance(chainSymbol, address);
  }

  async getPoolInfoByKey(poolKeyObject: PoolKeyObject): Promise<PoolInfo> {
    this.poolInfoCache.putAllIfNotExists((await this.client.getChainDetailsMapAndPoolInfoMap()).poolInfoMap);
    const poolInfo = this.poolInfoCache.get(poolKeyObject);
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    if (poolInfo) {
      return poolInfo;
    } else {
      const poolInfoMap = await this.client.getPoolInfoMap(poolKeyObject);
      this.poolInfoCache.putAll(poolInfoMap);
      return poolInfoMap[mapPoolKeyObjectToPoolKey(poolKeyObject)];
    }
  }

  async refreshPoolInfo(poolKeyObjects?: PoolKeyObject | PoolKeyObject[]): Promise<void> {
    let poolInfoMap;
    if (poolKeyObjects) {
      this.poolInfoCache.putAllIfNotExists((await this.client.getChainDetailsMapAndPoolInfoMap()).poolInfoMap);
      poolInfoMap = await this.client.getPoolInfoMap(poolKeyObjects);
    } else {
      const result = await this.client.getChainDetailsMapAndPoolInfoMap();
      poolInfoMap = await this.client.getPoolInfoMap(mapChainDetailsMapToPoolKeyObjects(result.chainDetailsMap));
    }
    this.poolInfoCache.putAll(poolInfoMap);
  }

  cachePut(poolKeyObject: PoolKeyObject, poolInfo: PoolInfo) {
    this.poolInfoCache.put(mapPoolKeyObjectToPoolKey(poolKeyObject), poolInfo);
  }
}

class PoolInfoCache {
  private cache;

  constructor() {
    this.cache = new Cache<PoolInfo>({ defaultTtl: _55_SECONDS_TTL });
  }

  putAll(poolInfoMap: PoolInfoMap) {
    for (const [key, value] of Object.entries(poolInfoMap)) {
      this.cache.put(key, value);
    }
  }

  putAllIfNotExists(poolInfoMap: PoolInfoMap) {
    for (const [key, value] of Object.entries(poolInfoMap)) {
      if (!this.cache.get(key)) {
        this.cache.put(key, value);
      }
    }
  }

  put(key: string, poolInfo: PoolInfo) {
    this.cache.put(key, poolInfo);
  }

  get(poolKeyObject: PoolKeyObject): PoolInfo | undefined {
    const key = mapPoolKeyObjectToPoolKey(poolKeyObject);
    return this.cache.get(key);
  }
}
