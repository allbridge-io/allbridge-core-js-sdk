import axios, { Axios } from "axios";
import { Big } from "big.js";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import { convertAmountPrecision } from "../../utils/calculation";
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
  polygonApiUrl: string;
}

export interface AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMap>;

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse>;

  getGasPriceForPolygon(): Promise<number>;
  getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string>;
}

export class AllbridgeCoreClientImpl implements AllbridgeCoreClient {
  private api: Axios;
  private readonly polygonApiUrl: string;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = axios.create({
      baseURL: params.apiUrl,
      headers: {
        Accept: "application/json",
      },
    });
    this.polygonApiUrl = params.polygonApiUrl;
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

  async getGasPriceForPolygon(): Promise<number> {
    const response = await axios.get(this.polygonApiUrl);
    return +Big(
      convertAmountPrecision(
        response.data.standard.maxPriorityFee.toString(),
        0,
        9
      )
    )
      .round(0)
      .toFixed();
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
