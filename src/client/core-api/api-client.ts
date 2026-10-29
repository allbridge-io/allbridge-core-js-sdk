import { Axios, AxiosHeaders, create, isAxiosError } from "axios";
import {
  InvalidMessengerOptionError,
  LifiIntentsAmountTooHighError,
  LifiIntentsAmountTooLowError,
  LifiIntentsDoesNotSupportedError,
  LifiIntentsNoQuoteError,
  LifiIntentsQuoteError,
  NearIntentsAmountTooLowError,
  NearIntentsDoesNotSupportedError,
  NearIntentsNoLiquidityError,
  NearIntentsQuoteError,
} from "../../exceptions";
import { ChainDetailsMapWithFlags, PoolInfoMap, PoolKeyObject } from "../../tokens-info";
import { VERSION } from "../../version";
import { mapChainDetailsResponseToChainDetailsMap, mapChainDetailsResponseToPoolInfoMap } from "./core-api-mapper";
import {
  ChainDetailsResponse,
  GasBalanceResponse,
  LifiIntentsErrorResponse,
  LifiIntentsOrderRequest,
  LifiIntentsOrderResponse,
  LifiIntentsQuoteRequest,
  LifiIntentsQuoteResponse,
  Messenger,
  NearIntentsDepositRequest,
  NearIntentsDepositResponse,
  NearIntentsErrorResponse,
  NearIntentsQuoteRequest,
  NearIntentsQuoteResponse,
  NearIntentsSubmitDepositRequest,
  PendingInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClientParams } from "./core-client-base";

export interface TokenInfo {
  chainDetailsMap: ChainDetailsMapWithFlags;
  /** @deprecated Do not use. */
  poolInfoMap: PoolInfoMap;
}

export interface ApiClient {
  getTokenInfo(): Promise<TokenInfo>;

  /** @deprecated Do not use. */
  getPendingInfo(): Promise<PendingInfoResponse>;

  getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse>;

  getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse>;

  getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse>;

  /** @deprecated Do not use. */
  getPoolInfoMap(pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap>;

  /**
   * `POST /near-intents/quote`: a dry NEAR Intents quote, see {@link mapNearIntentsError} for the thrown errors.
   */
  getNearIntentsQuote(args: NearIntentsQuoteRequest): Promise<NearIntentsQuoteResponse>;

  /**
   * `POST /near-intents/deposit`: a NEAR Intents quote with a one-shot deposit address.
   */
  createNearIntentsDeposit(args: NearIntentsDepositRequest): Promise<NearIntentsDepositResponse>;

  /**
   * `POST /near-intents/deposit/submit`: notifies NEAR Intents about the deposit transaction.
   */
  submitNearIntentsDeposit(args: NearIntentsSubmitDepositRequest): Promise<void>;

  /**
   * `POST /lifi-intents/quote`: a LI.FI Intents quote, see {@link mapLifiIntentsError} for the thrown errors.
   */
  getLifiIntentsQuote(args: LifiIntentsQuoteRequest): Promise<LifiIntentsQuoteResponse>;

  /**
   * `POST /lifi-intents/order`: a LI.FI Intents order with the ready-to-sign `LifiIntentsBridge` transaction.
   */
  createLifiIntentsOrder(args: LifiIntentsOrderRequest): Promise<LifiIntentsOrderResponse>;
}

/**
 * Maps an error of a Core API `/near-intents/*` call to a typed SDK error:
 * - HTTP 404 -> {@link NearIntentsDoesNotSupportedError}
 * - `AMOUNT_TOO_LOW` -> {@link NearIntentsAmountTooLowError} (with `minAmount` / `minAmountUsd` when known)
 * - `NO_LIQUIDITY` -> {@link NearIntentsNoLiquidityError}
 * - `FAILED_TO_GET_QUOTE`, `UPSTREAM_ERROR` or HTTP 502 -> {@link NearIntentsQuoteError}
 *
 * Any other error is returned unchanged.
 * @internal
 */
export function mapNearIntentsError(error: unknown): unknown {
  if (!isAxiosError(error) || !error.response) {
    return error;
  }
  const status = error.response.status;
  const body = (error.response.data ?? {}) as Partial<NearIntentsErrorResponse>;
  const message = typeof body.message === "string" ? body.message : undefined;
  switch (body.code) {
    case "AMOUNT_TOO_LOW":
      return new NearIntentsAmountTooLowError(
        message ?? "Amount is too low for NEAR Intents route",
        body.minAmount,
        body.minAmountUsd
      );
    case "NO_LIQUIDITY":
      return new NearIntentsNoLiquidityError(message ?? "No liquidity available for NEAR Intents route");
    case "FAILED_TO_GET_QUOTE":
    case "UPSTREAM_ERROR":
      return new NearIntentsQuoteError(message ?? "Failed to get NEAR Intents quote", body.code);
  }
  if (status === 404) {
    return new NearIntentsDoesNotSupportedError(message ?? "Such route does not support NEAR Intents protocol");
  }
  if (status === 502) {
    return new NearIntentsQuoteError(message ?? "NEAR Intents upstream error", "UPSTREAM_ERROR");
  }
  return error;
}

/**
 * Maps an error of a Core API `/lifi-intents/*` call to a typed SDK error:
 * - `PAIR_NOT_AVAILABLE` or a HTTP 404 without a code (LI.FI Intents disabled) -> {@link LifiIntentsDoesNotSupportedError}
 * - `AMOUNT_TOO_LOW` -> {@link LifiIntentsAmountTooLowError} (with `minAmount` when known)
 * - `AMOUNT_TOO_HIGH` -> {@link LifiIntentsAmountTooHighError} (with `maxAmount` when known)
 * - `NO_QUOTE` -> {@link LifiIntentsNoQuoteError}
 * - `INVALID_REQUEST`, `UPSTREAM_ERROR` or HTTP 502 -> {@link LifiIntentsQuoteError}
 *
 * Any other error is returned unchanged.
 * @internal
 */
export function mapLifiIntentsError(error: unknown): unknown {
  if (!isAxiosError(error) || !error.response) {
    return error;
  }
  const status = error.response.status;
  const body = (error.response.data ?? {}) as Partial<LifiIntentsErrorResponse>;
  const message = typeof body.message === "string" ? body.message : undefined;
  switch (body.code) {
    case "PAIR_NOT_AVAILABLE":
      return new LifiIntentsDoesNotSupportedError(message ?? "Such route does not support LI.FI Intents protocol");
    case "AMOUNT_TOO_LOW":
      return new LifiIntentsAmountTooLowError(message ?? "Amount is too low for LI.FI Intents route", body.minAmount);
    case "AMOUNT_TOO_HIGH":
      return new LifiIntentsAmountTooHighError(message ?? "Amount is too high for LI.FI Intents route", body.maxAmount);
    case "NO_QUOTE":
      return new LifiIntentsNoQuoteError(message ?? "No LI.FI Intents quote is available for this amount");
    case "INVALID_REQUEST":
    case "UPSTREAM_ERROR":
      return new LifiIntentsQuoteError(message ?? "Failed to get LI.FI Intents quote", body.code);
  }
  if (status === 404) {
    return new LifiIntentsDoesNotSupportedError(message ?? "Such route does not support LI.FI Intents protocol");
  }
  if (status === 502) {
    return new LifiIntentsQuoteError(message ?? "LI.FI Intents upstream error", "UPSTREAM_ERROR");
  }
  return error;
}

export class ApiClientImpl implements ApiClient {
  private api: Axios;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = create({
      baseURL: params.coreApiUrl,
      headers: {
        Accept: "application/json",
        ...params.coreApiHeaders,
        "x-Sdk-Agent": "AllbridgeCoreSDK/" + VERSION,
      },
      params: params.coreApiQueryParams,
    });

    if (params.coreApiHeadersProvider) {
      this.api.interceptors.request.use(async (config: { headers: any }) => {
        const dynamicHeaders = await params.coreApiHeadersProvider?.();
        if (!dynamicHeaders || Object.keys(dynamicHeaders).length === 0) {
          return config;
        }

        const headers = AxiosHeaders.from(config.headers);
        for (const [headerName, headerValue] of Object.entries(dynamicHeaders)) {
          if (!headerValue || headers.has(headerName)) {
            continue;
          }
          headers.set(headerName, headerValue);
        }

        config.headers = headers;
        return config;
      });
    }
  }

  async getTokenInfo(): Promise<TokenInfo> {
    const { data } = await this.api.get<ChainDetailsResponse>("/token-info", { params: { filter: "all" } });
    return {
      chainDetailsMap: mapChainDetailsResponseToChainDetailsMap(data),
      poolInfoMap: mapChainDetailsResponseToPoolInfoMap(data),
    };
  }

  /**
   * @deprecated Do not use.
   * The `/pending-info` endpoint was removed from the Core API together with the liquidity pools;
   * always resolves to an empty object without calling the server.
   */
  getPendingInfo(): Promise<PendingInfoResponse> {
    return Promise.resolve({});
  }

  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    const { data } = await this.api.get<GasBalanceResponse>(`/check/${chainSymbol}/${address}`);
    return data;
  }

  async getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse> {
    const { data } = await this.api.get<TransferStatusResponse>(`/chain/${chainSymbol}/${txId}`);
    return data;
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    if (args.messenger === Messenger.OFT && !args.sourceToken) {
      throw new InvalidMessengerOptionError("For OFT sourceToken required");
    }
    const { data } = await this.api.post<ReceiveTransactionCostResponse>("/receive-fee", args, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      exchangeRate: data.exchangeRate,
      fee: data.fee,
      sourceNativeTokenPrice: data.sourceNativeTokenPrice,
      abrExchangeRate: data.abrExchangeRate,
      adminFeeShareWithExtras: data.adminFeeShareWithExtras,
    };
  }

  /**
   * @deprecated Do not use.
   * The `/pool-info` endpoint was removed from the Core API together with the liquidity pools;
   * always resolves to an empty map without calling the server.
   */
  getPoolInfoMap(_pools: PoolKeyObject[] | PoolKeyObject): Promise<PoolInfoMap> {
    return Promise.resolve({});
  }

  async getNearIntentsQuote(args: NearIntentsQuoteRequest): Promise<NearIntentsQuoteResponse> {
    try {
      const { data } = await this.api.post<NearIntentsQuoteResponse>("/near-intents/quote", args, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (e) {
      throw mapNearIntentsError(e);
    }
  }

  async createNearIntentsDeposit(args: NearIntentsDepositRequest): Promise<NearIntentsDepositResponse> {
    try {
      const { data } = await this.api.post<NearIntentsDepositResponse>("/near-intents/deposit", args, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (e) {
      throw mapNearIntentsError(e);
    }
  }

  async submitNearIntentsDeposit(args: NearIntentsSubmitDepositRequest): Promise<void> {
    try {
      await this.api.post("/near-intents/deposit/submit", args, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      throw mapNearIntentsError(e);
    }
  }

  async getLifiIntentsQuote(args: LifiIntentsQuoteRequest): Promise<LifiIntentsQuoteResponse> {
    try {
      const { data } = await this.api.post<LifiIntentsQuoteResponse>("/lifi-intents/quote", args, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (e) {
      throw mapLifiIntentsError(e);
    }
  }

  async createLifiIntentsOrder(args: LifiIntentsOrderRequest): Promise<LifiIntentsOrderResponse> {
    try {
      const { data } = await this.api.post<LifiIntentsOrderResponse>("/lifi-intents/order", args, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (e) {
      throw mapLifiIntentsError(e);
    }
  }
}
