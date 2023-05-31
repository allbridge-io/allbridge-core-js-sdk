import Cache from "timed-cache";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, Pool, PoolMap, PoolKeyObject, TokenWithChainDetails } from "../../tokens-info";
import { mapChainDetailsMapToPoolKeyObjects, mapPoolKeyObjectToPoolKey } from "./core-api-mapper";
import { ReceiveTransactionCostRequest, TransferStatusResponse } from "./core-api.model";
import { AllbridgeCoreClient, AllbridgeCoreClientImpl } from "./index";

export class AllbridgeCachingCoreClient implements AllbridgeCoreClient {
  private readonly client;
  private readonly poolCache;

  constructor(client: AllbridgeCoreClientImpl) {
    this.client = client;
    this.poolCache = new PoolCache();
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    const result = await this.client.getChainDetailsMapAndPoolMap();
    this.poolCache.putAll(result.poolMap);
    return result.chainDetailsMap;
  }
  async tokens(): Promise<TokenWithChainDetails[]> {
    return await this.client.tokens();
  }

  getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return this.client.getTransferStatus(chainSymbol, txId);
  }

  getPolygonGasInfo(): Promise<{
    maxPriorityFee: string;
    maxFee: string;
  }> {
    return this.client.getPolygonGasInfo();
  }

  async getPolygonMaxPriorityFee(): Promise<string> {
    return await this.client.getPolygonMaxPriorityFee();
  }

  async getPolygonMaxFee(): Promise<string> {
    return await this.client.getPolygonMaxFee();
  }

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<{
    fee: string;
    sourceNativeTokenPrice?: string;
  }> {
    return this.client.getReceiveTransactionCost(args);
  }

  async getPoolByKey(poolKeyObject: PoolKeyObject): Promise<Pool> {
    const pool = this.poolCache.get(poolKeyObject);
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    if (pool) {
      return pool;
    } else {
      const poolMap = await this.client.getPoolMap(poolKeyObject);
      this.poolCache.putAll(poolMap);
      return poolMap[mapPoolKeyObjectToPoolKey(poolKeyObject)];
    }
  }

  async refreshPools(): Promise<void> {
    const result = await this.client.getChainDetailsMapAndPoolMap();
    const poolMap = await this.client.getPoolMap(mapChainDetailsMapToPoolKeyObjects(result.chainDetailsMap));
    this.poolCache.putAll(poolMap);
  }
}

class PoolCache {
  private cache;

  constructor() {
    this.cache = new Cache<Pool>({ defaultTtl: 120 * 1000 });
  }

  putAll(poolMap: PoolMap) {
    for (const [key, value] of Object.entries(poolMap)) {
      this.cache.put(key, value);
    }
  }

  get(poolKeyObject: PoolKeyObject): Pool | undefined {
    const key = mapPoolKeyObjectToPoolKey(poolKeyObject);
    return this.cache.get(key);
  }
}
