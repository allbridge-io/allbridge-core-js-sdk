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
import { AllbridgeCoreClient, AllbridgeCoreClientImpl } from "./index";

export class AllbridgeCachingCoreClient implements AllbridgeCoreClient {
  private readonly client;
  private chainDetailsMap?: ChainDetailsMap;
  private readonly poolInfoCache;

  constructor(client: AllbridgeCoreClientImpl) {
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
    let poolInfoMap;
    if (this.chainDetailsMap === undefined) {
      const result = await this.client.getChainDetailsMapAndPoolInfoMap();
      this.chainDetailsMap = result.chainDetailsMap;
      poolInfoMap = result.poolInfoMap;
    } else {
      poolInfoMap = await this.client.getPoolInfoMap(
        mapChainDetailsMapToPoolKeyObjects(this.chainDetailsMap)
      );
    }
    this.poolInfoCache.putAll(poolInfoMap);
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
