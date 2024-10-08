import {
  ChainDetailsMapWithFlags,
  PoolInfoMap,
  PoolKeyObject,
  TokenWithChainDetailsWithFlags,
} from "../../tokens-info";
import { ApiClient } from "./api-client";
import {
  GasBalanceResponse,
  PendingInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

export interface AllbridgeCoreClientParams {
  coreApiUrl: string;
  coreApiHeaders?: Record<string, string>;
  coreApiQueryParams?: Record<string, string>;
}

export interface AllbridgeCoreClient {
  getPendingInfo(): Promise<PendingInfoResponse>;

  getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse>;

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse>;

  getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse>;
}

export interface AllbridgeCoreClientWithTokens extends AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMapWithFlags>;

  tokens(): Promise<TokenWithChainDetailsWithFlags[]>;
}

export interface AllbridgeCoreClientWithPoolInfo extends AllbridgeCoreClientWithTokens {
  getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMapWithFlags;
    poolInfoMap: PoolInfoMap;
  }>;

  getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap>;
}

export class AllbridgeCoreClientImpl implements AllbridgeCoreClientWithPoolInfo {
  constructor(private apiClient: ApiClient) {}

  async getChainDetailsMap(): Promise<ChainDetailsMapWithFlags> {
    return (await this.apiClient.getTokenInfo()).chainDetailsMap;
  }

  async tokens(): Promise<TokenWithChainDetailsWithFlags[]> {
    const map = await this.getChainDetailsMap();
    return Object.values(map).flatMap((chainDetails) => chainDetails.tokens);
  }

  async getPendingInfo(): Promise<PendingInfoResponse> {
    return this.apiClient.getPendingInfo();
  }

  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    return this.apiClient.getGasBalance(chainSymbol, address);
  }

  async getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMapWithFlags;
    poolInfoMap: PoolInfoMap;
  }> {
    return await this.apiClient.getTokenInfo();
  }

  async getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse> {
    return await this.apiClient.getTransferStatus(chainSymbol, txId);
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return await this.apiClient.getReceiveTransactionCost(args);
  }

  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return await this.apiClient.getPoolInfoMap(pools);
  }
}
