import Cache from "timed-cache";
import { ChainSymbol } from "../../chains";
import { PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import { ApiClient, TokenInfo } from "./api-client";
import {
  GasBalanceResponse,
  PendingInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

const _20_SECONDS_TTL = 20 * 1000;
const _55_SECONDS_TTL = 55 * 1000;

export class ApiClientCaching implements ApiClient {
  private tokenInfoCache: Cache<Promise<TokenInfo>>;
  private pendingInfoCache: Cache<Promise<PendingInfoResponse>>;
  private gasBalanceCache: Cache<Promise<GasBalanceResponse>>;
  private receivedTransactionCache: Cache<ReceiveTransactionCostResponse>;

  constructor(private apiClient: ApiClient) {
    this.tokenInfoCache = new Cache({ defaultTtl: _55_SECONDS_TTL });
    this.receivedTransactionCache = new Cache({ defaultTtl: _20_SECONDS_TTL });
    this.pendingInfoCache = new Cache({ defaultTtl: _20_SECONDS_TTL });
    this.gasBalanceCache = new Cache({ defaultTtl: _20_SECONDS_TTL });
  }

  getTokenInfo(): Promise<TokenInfo> {
    const TOKEN_INFO_CACHE_KEY = "TOKEN_INFO_CACHE_KEY";
    const tokenInfo = this.tokenInfoCache.get(TOKEN_INFO_CACHE_KEY);
    if (tokenInfo) {
      return tokenInfo;
    }
    const tokenInfoPromise = this.apiClient.getTokenInfo();
    this.tokenInfoCache.put(TOKEN_INFO_CACHE_KEY, tokenInfoPromise);
    return tokenInfoPromise;
  }

  async getGasBalance(chainSymbol: ChainSymbol, address: string): Promise<GasBalanceResponse> {
    const GAS_BALANCE_CACHE_KEY = `GAS_BALANCE_${chainSymbol}_${address}`;
    const gasBalance = this.gasBalanceCache.get(GAS_BALANCE_CACHE_KEY);
    if (gasBalance) {
      return gasBalance;
    }
    const gasBalancePromise = this.apiClient.getGasBalance(chainSymbol, address);
    this.gasBalanceCache.put(GAS_BALANCE_CACHE_KEY, gasBalancePromise);
    return gasBalancePromise;
  }

  async getPendingInfo(): Promise<PendingInfoResponse> {
    const PENDING_INFO_CACHE_KEY = "PENDING_INFO_CACHE_KEY";
    const pendingInfo = this.pendingInfoCache.get(PENDING_INFO_CACHE_KEY);
    if (pendingInfo) {
      return pendingInfo;
    }
    const pendingInfoPromise = this.apiClient.getPendingInfo();
    this.pendingInfoCache.put(PENDING_INFO_CACHE_KEY, pendingInfoPromise);
    return pendingInfoPromise;
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    const RECEIVE_TX_COST_KEY = `RECEIVE_TX_COST_${args.sourceChainId}_${args.destinationChainId}_${args.messenger}`;
    const transactionCost = this.receivedTransactionCache.get(RECEIVE_TX_COST_KEY);
    if (transactionCost) {
      return transactionCost;
    }
    const fetchedTransactionCost = await this.apiClient.getReceiveTransactionCost(args);
    this.receivedTransactionCache.put(RECEIVE_TX_COST_KEY, fetchedTransactionCost);
    return fetchedTransactionCost;
  }

  async getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return this.apiClient.getTransferStatus(chainSymbol, txId);
  }

  async getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return this.apiClient.getPoolInfoMap(pools);
  }
}
