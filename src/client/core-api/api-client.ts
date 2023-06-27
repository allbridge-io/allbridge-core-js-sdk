import axios, { Axios } from "axios";
import { ChainSymbol } from "../../chains";
import { sleep } from "../../services/utils";
import { ChainDetailsMap, PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import { VERSION } from "../../version";
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
import { AllbridgeCoreClientParams } from "./index";

export interface TokenInfo {
  chainDetailsMap: ChainDetailsMap;
  poolInfoMap: PoolInfoMap;
}

export interface ApiClient {
  getTokenInfo(): Promise<TokenInfo>;
  getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse>;
  getPolygonGasInfoFromGasStation(level: "safeLow" | "standard" | "fast"): Promise<{
    maxPriorityFee: number;
    maxFee: number;
  }>;
  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<{
    fee: string;
    sourceNativeTokenPrice?: string;
  }>;
  getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap>;
}

export class ApiClientImpl implements ApiClient {
  private api: Axios;
  private readonly polygonApiUrl: string;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = axios.create({
      baseURL: params.coreApiUrl,
      headers: {
        Accept: "application/json",
        ...params.coreApiHeaders,
      },
    });
    this.polygonApiUrl = params.polygonApiUrl;
  }

  async getTokenInfo(): Promise<TokenInfo> {
    const { data } = await this.api.get<ChainDetailsResponse>("/token-info");
    return {
      chainDetailsMap: mapChainDetailsResponseToChainDetailsMap(data),
      poolInfoMap: mapChainDetailsResponseToPoolInfoMap(data),
    };
  }

  async getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    const { data } = await this.api.get<TransferStatusResponse>(`/chain/${chainSymbol}/${txId}`);
    return data;
  }

  async getPolygonGasInfoFromGasStation(level: "safeLow" | "standard" | "fast" = "standard"): Promise<{
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
            : `Cannot get polygon gas: ${e?.toString() ?? "some error occurred"}`;
        if (i < attempts - 1) {
          await sleep(1000);
        }
      }
    }
    throw new Error(errorMessage);
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<{
    fee: string;
    sourceNativeTokenPrice?: string;
  }> {
    const { data } = await this.api.post<ReceiveTransactionCostResponse>("/receive-fee", args, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      fee: data.fee,
      sourceNativeTokenPrice: data.sourceNativeTokenPrice,
    };
  }

  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
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
