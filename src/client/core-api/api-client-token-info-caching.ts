import Cache from "timed-cache";
import { ChainSymbol } from "../../chains";
import { PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import { ApiClient, TokenInfo } from "./api-client";
import {
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

const TWO_MINUTES_TTL = 120 * 1000;

export class ApiClientTokenInfoCaching implements ApiClient {
  private tokenInfoCache: Cache<TokenInfo>;

  constructor(private apiClient: ApiClient) {
    this.tokenInfoCache = new Cache<TokenInfo>({ defaultTtl: TWO_MINUTES_TTL });
  }

  async getTokenInfo(): Promise<TokenInfo> {
    const TOKEN_INFO_CACHE_KEY = "TOKEN_INFO_CACHE_KEY";
    const tokenInfo = this.tokenInfoCache.get(TOKEN_INFO_CACHE_KEY);
    if (tokenInfo) {
      return tokenInfo;
    }
    const fetchedTokenInfo = await this.apiClient.getTokenInfo();
    this.tokenInfoCache.put(TOKEN_INFO_CACHE_KEY, fetchedTokenInfo);
    return fetchedTokenInfo;
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return this.apiClient.getReceiveTransactionCost(args);
  }

  async getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return this.apiClient.getTransferStatus(chainSymbol, txId);
  }
  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return this.apiClient.getPoolInfoMap(pools);
  }
}
