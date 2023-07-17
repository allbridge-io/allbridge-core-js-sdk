import { Big } from "big.js";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap, PoolInfoMap, PoolKeyObject, TokenWithChainDetails } from "../../tokens-info";
import { ApiClient } from "./api-client";
import {
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

export interface AllbridgeCoreClientParams {
  coreApiUrl: string;
  coreApiHeaders?: Record<string, string>;
  polygonApiUrl: string;
}

export interface AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMap>;
  tokens(): Promise<TokenWithChainDetails[]>;

  getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse>;

  getPolygonGasInfo(): Promise<{
    maxPriorityFee: string;
    maxFee: string;
  }>;

  getPolygonMaxPriorityFee(): Promise<string>;

  getPolygonMaxFee(): Promise<string>;

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse>;
}

export class AllbridgeCoreClientImpl implements AllbridgeCoreClient {
  constructor(private apiClient: ApiClient) {}

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    return (await this.apiClient.getTokenInfo()).chainDetailsMap;
  }

  async tokens(): Promise<TokenWithChainDetails[]> {
    const map = await this.getChainDetailsMap();
    return Object.values(map).flatMap((chainDetails) => chainDetails.tokens);
  }

  async getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMap;
    poolInfoMap: PoolInfoMap;
  }> {
    return await this.apiClient.getTokenInfo();
  }

  async getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return await this.apiClient.getTransferStatus(chainSymbol, txId);
  }

  async getPolygonMaxPriorityFee(): Promise<string> {
    const gasInfo = await this.getPolygonGasInfoFromGasStation();
    const maxPriorityFeeGwei = gasInfo.maxPriorityFee;
    return Big(maxPriorityFeeGwei).times(1e9).toFixed(0);
  }

  async getPolygonMaxFee(): Promise<string> {
    const gasInfo = await this.getPolygonGasInfoFromGasStation();
    const maxFeeGwei = gasInfo.maxFee;
    return Big(maxFeeGwei).times(1e9).toFixed(0);
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

  private async getPolygonGasInfoFromGasStation(level: "safeLow" | "standard" | "fast" = "standard"): Promise<{
    maxPriorityFee: number;
    maxFee: number;
  }> {
    return await this.apiClient.getPolygonGasInfoFromGasStation(level);
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return await this.apiClient.getReceiveTransactionCost(args);
  }

  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return await this.apiClient.getPoolInfoMap(pools);
  }
}
