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
}

export interface AllbridgeCoreClient {
  getChainDetailsMap(): Promise<ChainDetailsMap>;
  tokens(): Promise<TokenWithChainDetails[]>;

  getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse>;

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

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return await this.apiClient.getReceiveTransactionCost(args);
  }

  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return await this.apiClient.getPoolInfoMap(pools);
  }
}
