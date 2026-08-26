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
  coreApiHeadersProvider?: () => Promise<Record<string, string> | undefined>;
  coreApiQueryParams?: Record<string, string>;
}

export interface AllbridgeCoreClient {
  /** @deprecated Do not use. */
  getPendingInfo(): Promise<PendingInfoResponse>;

  getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse>;

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse>;

  getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse>;
}

export interface AllbridgeCoreClientWithTokens extends AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMapWithFlags>;

  tokens(): Promise<TokenWithChainDetailsWithFlags[]>;
}

/**
 * @deprecated Do not use.
 */
export interface AllbridgeCoreClientWithPoolInfo extends AllbridgeCoreClientWithTokens {
  /** @deprecated Do not use. */
  getChainDetailsMapAndPoolInfoMap(): Promise<{
    chainDetailsMap: ChainDetailsMapWithFlags;
    poolInfoMap: PoolInfoMap;
  }>;

  /** @deprecated Do not use. */
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

  /** @deprecated Do not use. */
  async getPendingInfo(): Promise<PendingInfoResponse> {
    return this.apiClient.getPendingInfo();
  }

  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    return this.apiClient.getGasBalance(chainSymbol, address);
  }

  /** @deprecated Do not use. */
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

  /** @deprecated Do not use. */
  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return await this.apiClient.getPoolInfoMap(pools);
  }
}
