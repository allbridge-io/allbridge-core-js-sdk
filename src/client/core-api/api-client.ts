import axios, { Axios } from "axios";
import { ChainSymbol } from "../../chains";
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
  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse>;
  getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap>;
}

export class ApiClientImpl implements ApiClient {
  private api: Axios;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = axios.create({
      baseURL: params.coreApiUrl,
      headers: {
        Accept: "application/json",
        ...params.coreApiHeaders,
        "x-Sdk-Agent": "AllbridgeCoreSDK/" + VERSION,
      },
      params: params.coreApiQueryParams,
    });
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

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    const { data } = await this.api.post<ReceiveTransactionCostResponse>("/receive-fee", args, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      exchangeRate: data.exchangeRate,
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
