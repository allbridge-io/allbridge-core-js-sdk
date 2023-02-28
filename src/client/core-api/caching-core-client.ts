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
  private readonly poolInfoCache;

  constructor(client: AllbridgeCoreClientImpl) {
    this.client = client;
    this.poolInfoCache = new PoolInfoCache();
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    const result = await this.client.getChainDetailsMapAndPoolInfoMap();
    this.poolInfoCache.putAll(result.poolInfoMap);
    return result.chainDetailsMap;
  }

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    return this.client.getTransferStatus(chainSymbol, txId);
  }

  getGasPriceForPolygon(): Promise<number> {
    return this.client.getGasPriceForPolygon();
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
    const result = await this.client.getChainDetailsMapAndPoolInfoMap();
    const poolInfoMap = await this.client.getPoolInfoMap(
      mapChainDetailsMapToPoolKeyObjects(result.chainDetailsMap)
    );
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
