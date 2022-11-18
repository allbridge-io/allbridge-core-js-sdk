import Cache from "timed-cache";
import { ChainSymbol } from "../../chains";
import {
  ChainDetailsMap,
  PoolInfo,
  PoolInfoMap,
  PoolKeyObject,
} from "../../tokens-info";
import {
  mapChainDetailsMapToPoolKeyObjects,
  mapPoolKeyObjectToPoolKey,
} from "./core-api-mapper";
import {
  ReceiveTransactionCostRequest,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClient } from "./index";

export class AllbridgeCachingCoreClient implements AllbridgeCoreClient {
  private readonly client;
  private chainDetailsMap?: ChainDetailsMap;
  private readonly poolInfoCache;

  constructor(client: AllbridgeCoreClient) {
    this.client = client;
    this.poolInfoCache = new PoolInfoCache();
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    if (this.chainDetailsMap === undefined) {
      const result = await this.client.getChainDetailsMapAndPoolInfoMap();
      this.chainDetailsMap = result.chainDetailsMap;
      this.poolInfoCache.putAll(result.poolInfoMap);
    }
    return this.chainDetailsMap;
  }

  async getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMap;
    poolInfoMap: PoolInfoMap;
  }> {
    if (this.chainDetailsMap === undefined) {
      const result = await this.client.getChainDetailsMapAndPoolInfoMap();
      this.chainDetailsMap = result.chainDetailsMap;
      this.poolInfoCache.putAll(result.poolInfoMap);
      return result;
    }

    const poolInfoMap = await this.client.getPoolInfoMap(
      mapChainDetailsMapToPoolKeyObjects(this.chainDetailsMap)
    );
    this.poolInfoCache.putAll(poolInfoMap);

    return {
      chainDetailsMap: this.chainDetailsMap,
      poolInfoMap: poolInfoMap,
    };
  }

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    return this.client.getTransferStatus(chainSymbol, txId);
  }

  getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string> {
    return this.client.getReceiveTransactionCost(args);
  }

  async getPoolInfoMap(
    pools: PoolKeyObject[] | PoolKeyObject
  ): Promise<PoolInfoMap> {
    const poolInfoMap = await this.client.getPoolInfoMap(pools);
    this.poolInfoCache.putAll(poolInfoMap);
    return poolInfoMap;
  }

  async getPoolInfoByKey(poolKeyObject: PoolKeyObject): Promise<PoolInfo> {
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

  async refreshPoolInfo(): Promise<void> {
    await this.getChainDetailsMapAndPoolInfoMap();
  }
}

class PoolInfoCache {
  private cache;

  constructor() {
    this.cache = new Cache<PoolInfo>({ defaultTtl: 120 * 1000 });
  }

  putAll(poolInfoMap: PoolInfoMap) {
    for (const [key, value] of Object.entries(poolInfoMap)) {
      this.cache.put(key, value);
    }
  }

  get(poolKeyObject: PoolKeyObject): PoolInfo | undefined {
    const key = mapPoolKeyObjectToPoolKey(poolKeyObject);
    return this.cache.get(key);
  }
}
