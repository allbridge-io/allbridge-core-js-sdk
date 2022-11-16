import { ChainSymbol } from "../../chains";
import {
  ChainDetailsMap,
  PoolInfo,
  PoolInfoMap,
  PoolKeyObject,
} from "../../tokens-info";
import {
  mapPoolKeyObjectToPoolKey,
  mapPoolKeyToPoolKeyObject,
} from "./core-api-mapper";
import {
  ReceiveTransactionCostRequest,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClient } from "./index";

export class AllbridgeCachingCoreClient implements AllbridgeCoreClient {
  private readonly client;
  private chainDetailsMap?: ChainDetailsMap;
  private poolInfoMap: PoolInfoMap = {};

  constructor(client: AllbridgeCoreClient) {
    this.client = client;
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    if (this.chainDetailsMap === undefined) {
      const result = await this.client.getChainDetailsMapAndPoolInfoMap();
      this.chainDetailsMap = result.chainDetailsMap;
      this.poolInfoMap = result.poolInfoMap;
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
      this.poolInfoMap = result.poolInfoMap;
    }
    return {
      chainDetailsMap: this.chainDetailsMap,
      poolInfoMap: this.poolInfoMap,
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
    this.poolInfoMap = await this.client.getPoolInfoMap(pools);
    return this.poolInfoMap;
  }

  async getPoolInfoByKey(poolKeyObject: PoolKeyObject): Promise<PoolInfo> {
    const poolKey = mapPoolKeyObjectToPoolKey(poolKeyObject);
    const poolInfo = this.poolInfoMap[poolKey];
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    if (poolInfo) {
      return poolInfo;
    } else {
      this.poolInfoMap = {
        ...this.poolInfoMap,
        ...(await this.client.getPoolInfoMap(poolKeyObject)),
      };
      return this.poolInfoMap[poolKey];
    }
  }

  async refreshPoolInfo(): Promise<void> {
    const poolKeyObjects = Object.keys(this.poolInfoMap).map((poolKey) =>
      mapPoolKeyToPoolKeyObject(poolKey)
    );

    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    if (poolKeyObjects) {
      this.poolInfoMap = await this.client.getPoolInfoMap(poolKeyObjects);
    }
  }
}
