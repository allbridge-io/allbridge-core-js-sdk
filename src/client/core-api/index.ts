import axios, { Axios } from "axios";
import { Big } from "big.js";
import { ChainSymbol } from "../../chains";
import { sleep } from "../../services/bridge/utils";
import {
  ChainDetailsMap,
  PoolInfoMap,
  PoolKeyObject,
  TokenInfoWithChainDetails,
} from "../../tokens-info";
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
  tokens(): Promise<TokenInfoWithChainDetails[]>;

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse>;

  getPolygonGasInfo(): Promise<{
    maxPriorityFee: string;
    maxFee: string;
  }>;

  getPolygonMaxPriorityFee(): Promise<string>;

  getPolygonMaxFee(): Promise<string>;

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

  async tokens(): Promise<TokenInfoWithChainDetails[]> {
    const map = await this.getChainDetailsMap();
    return Object.values(map).flatMap((chainDetails) => chainDetails.tokens);
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

  async getPolygonMaxPriorityFee(): Promise<string> {
    const gasInfo = await this.getPolygonGasInfoFromGasStation();
    const maxPriorityFeeGwai = gasInfo.maxPriorityFee;
    return Big(maxPriorityFeeGwai).times(1e9).toFixed(0);
  }

  async getPolygonMaxFee(): Promise<string> {
    const gasInfo = await this.getPolygonGasInfoFromGasStation();
    const maxFeeGwai = gasInfo.maxFee;
    return Big(maxFeeGwai).times(1e9).toFixed(0);
  }

  async getPolygonGasInfo(): Promise<{
    maxPriorityFee: string;
    maxFee: string;
  }> {
    const gasInfo = await this.getPolygonGasInfoFromGasStation();
    return {
      maxPriorityFee: Big(gasInfo.maxPriorityFee).times(1e9).toFixed(0),
      maxFee: Big(gasInfo.maxFee).times(1e9).toFixed(0),
    };
  }

  private async getPolygonGasInfoFromGasStation(
    level: "safeLow" | "standard" | "fast" = "standard"
  ): Promise<{
    maxPriorityFee: number;
    maxFee: number;
  }> {
    let errorMessage = "no message";
    const attempts = 5;
    for (let i = 0; i < attempts; i++) {
      try {
        const { data } = await axios.get(this.polygonApiUrl);
        if (!data[level]) {
          throw new Error(`No data for ${level} level`);
        }
        return data[level];
      } catch (e) {
        errorMessage =
          e instanceof Error
            ? `Cannot get polygon gas: ${e.message}`
            : `Cannot get polygon gas: ${
                e?.toString() ?? "some error occurred"
              }`;
        if (i < attempts - 1) {
          await sleep(1000);
        }
      }
    }
    throw new Error(errorMessage);
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
