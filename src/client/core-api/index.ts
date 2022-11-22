import axios, { Axios } from "axios";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import {
  mapChainDetailsResponseToChainDetailsMap,
  mapChainDetailsResponseToPoolInfoMap,
  mapPoolInfoResponseToPoolInfoMap,
} from "./core-api-mapper";
import {
  ChainDetailsResponse,
  PoolInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

export interface AllbridgeCoreClientParams {
  apiUrl: string;
}

export interface AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMap>;

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse>;

  getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string>;
}

export class AllbridgeCoreClientImpl implements AllbridgeCoreClient {
  private api: Axios;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = axios.create({
      baseURL: params.apiUrl,
      headers: {
        Accept: "application/json",
      },
    });
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    const { data } = await this.api.get<ChainDetailsResponse>("/token-info");
    return mapChainDetailsResponseToChainDetailsMap(data);
  }

  async getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMap;
    poolInfoMap: PoolInfoMap;
  }> {
    const { data } = await this.api.get<ChainDetailsResponse>("/token-info");
    return {
      chainDetailsMap: mapChainDetailsResponseToChainDetailsMap(data),
      poolInfoMap: mapChainDetailsResponseToPoolInfoMap(data),
    };
  }

  async getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    const { data } = await this.api.get<TransferStatusResponse>(
      `/chain/${chainSymbol}/${txId}`
    );
    return data;
  }

  async getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string> {
    const { data } = await this.api.post<ReceiveTransactionCostResponse>(
      "/receive-fee",
      args,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.fee;
  }

  async getPoolInfoMap(
    pools: PoolKeyObject[] | PoolKeyObject
  ): Promise<PoolInfoMap> {
    const poolKeys = pools instanceof Array ? pools : [pools];
    const { data } = await this.api.post<PoolInfoResponse>(
      "/pool-info",
      { pools: poolKeys },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return mapPoolInfoResponseToPoolInfoMap(data);
  }
}
