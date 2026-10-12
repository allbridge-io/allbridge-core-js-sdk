import nock from "nock";
import { ChainSymbol } from "../../../chains/chain.enums";
import { ApiClientImpl } from "../../../client/core-api/api-client";
import {
  AddressStatus,
  Messenger,
  NearIntentsDepositRequest,
  NearIntentsDepositResponse,
  NearIntentsQuoteRequest,
  NearIntentsQuoteResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClientImpl } from "../../../client/core-api/core-client-base";
import {
  NearIntentsAmountTooLowError,
  NearIntentsDoesNotSupportedError,
  NearIntentsNoLiquidityError,
  NearIntentsQuoteError,
} from "../../../exceptions";
import { ChainDetailsMapWithFlags, PoolKeyObject } from "../../../tokens-info";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMapWithFlags.json";
import transferStatus from "../../data/transfer-status/TransferStatus.json";
import transferStatusResponse from "../../mock/core-api/send-status.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";
import { getRequestBodyMatcher, initChainsWithTestnet } from "../../mock/utils";

const expectedTokensGroupedByChain = tokensGroupedByChain as unknown as ChainDetailsMapWithFlags;
const expectedTransferStatus = transferStatus as unknown as TransferStatusResponse;

initChainsWithTestnet();

describe("AllbridgeCoreClient", () => {
  const api = new AllbridgeCoreClientImpl(
    new ApiClientImpl({
      coreApiUrl: "http://localhost",
    })
  );

  describe("given /token-info endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost").get("/token-info?filter=all").reply(200, tokenInfoResponse);
    });

    it("☀️ getChainDetailsMap() returns ChainDetailsMap", async () => {
      expect(await api.getChainDetailsMap()).toEqual(expectedTokensGroupedByChain);
      scope.done();
    });
  });

  describe("given /chain/ChainSymbol/txId endpoint", () => {
    const chainSymbol = ChainSymbol.TRX;
    const txId = "0417a44b76793d32c316c1e8d05de99f5929e07415a4a87e4e858cf371ef467a";
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost").get(`/chain/${chainSymbol}/${txId}`).reply(200, transferStatusResponse);
    });

    it("☀️ getTransferStatus returns TransferStatusResponse", async () => {
      const actual = await api.getTransferStatus(chainSymbol, txId);
      expect(actual).toEqual(expectedTransferStatus);
      scope.done();
    });

    it("☀️ getTransferStatus passes the refunded flag through", async () => {
      // drop the beforeEach interceptor this test does not use, or it leaks into later tests
      nock.cleanAll();
      const refundedTxId = "1".repeat(64);
      const refundedScope = nock("http://localhost")
        .get(`/chain/${chainSymbol}/${refundedTxId}`)
        .reply(200, { ...transferStatusResponse, refunded: true });
      const actual: TransferStatusResponse = await api.getTransferStatus(chainSymbol, refundedTxId);
      expect(actual.refunded).toBe(true);
      refundedScope.done();
    });

    it("☀️ getTransferStatus passes the refund details through", async () => {
      nock.cleanAll();
      const refundedTxId = "2".repeat(64);
      const refundTxId = "0x9e49f10107dabdfd413de4042df1d453ef6be8296d04090f2a48ceedcf35b0da";
      const refundedScope = nock("http://localhost")
        .get(`/chain/${chainSymbol}/${refundedTxId}`)
        .reply(200, {
          ...transferStatusResponse,
          refunded: true,
          refundTxId,
          refundedAmount: "7999989817",
          refundedAmountFormatted: 7999.989817,
        });
      const actual: TransferStatusResponse = await api.getTransferStatus(chainSymbol, refundedTxId);
      expect(actual.refundTxId).toEqual(refundTxId);
      expect(actual.refundedAmount).toEqual("7999989817");
      expect(actual.refundedAmountFormatted).toEqual(7999.989817);
      refundedScope.done();
    });

    it("☀️ getTransferStatus keeps null refund details of a transfer not yet indexed", async () => {
      nock.cleanAll();
      const refundedTxId = "3".repeat(64);
      const refundedScope = nock("http://localhost")
        .get(`/chain/${chainSymbol}/${refundedTxId}`)
        .reply(200, {
          ...transferStatusResponse,
          refunded: true,
          refundTxId: null,
          refundedAmount: null,
          refundedAmountFormatted: null,
        });
      const actual: TransferStatusResponse = await api.getTransferStatus(chainSymbol, refundedTxId);
      expect(actual.refundTxId).toBeNull();
      expect(actual.refundedAmount).toBeNull();
      expect(actual.refundedAmountFormatted).toBeNull();
      refundedScope.done();
    });
  });

  describe("given /receive-fee endpoint", () => {
    let scope: nock.Scope;
    const fee = "20000000000000000";
    const sourceNativeTokenPrice = "1501";
    const exchangeRate = "0.12550590438537169016";
    const receiveFeeRequest: ReceiveTransactionCostRequest = {
      sourceChainId: 2,
      destinationChainId: 4,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeResponse: ReceiveTransactionCostResponse = { fee, sourceNativeTokenPrice, exchangeRate };

    beforeEach(() => {
      scope = nock("http://localhost")
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
        .reply(201, receiveFeeResponse);
    });

    it("☀️ getReceiveTransactionCost returns fee", async () => {
      const actual = await api.getReceiveTransactionCost(receiveFeeRequest);
      expect(actual).toMatchObject({
        exchangeRate: "0.12550590438537169016",
        fee: "20000000000000000",
        sourceNativeTokenPrice: "1501",
      });
      scope.done();
    });
  });

  describe("given Core API without liquidity pools", () => {
    it("☀️ getChainDetailsMap() maps /token-info without pool fields and flags", async () => {
      const tokenInfoWithoutPools = JSON.parse(JSON.stringify(tokenInfoResponse)) as Record<string, any>;
      for (const chainDetails of Object.values(tokenInfoWithoutPools)) {
        delete chainDetails.bridgeAddress;
        for (const token of chainDetails.tokens) {
          delete token.poolAddress;
          delete token.poolInfo;
          delete token.feeShare;
          delete token.apr;
          delete token.lpRate;
          delete token.flags;
        }
      }
      const scope = nock("http://localhost").get("/token-info?filter=all").reply(200, tokenInfoWithoutPools);

      const { chainDetailsMap, poolInfoMap } = await api.getChainDetailsMapAndPoolInfoMap();

      expect(Object.keys(chainDetailsMap)).toEqual(Object.keys(expectedTokensGroupedByChain));
      expect(chainDetailsMap.GRL?.tokens.map((token) => token.flags)).toEqual(
        expectedTokensGroupedByChain.GRL?.tokens.map(() => ({ swap: true, pool: false }))
      );
      expect(poolInfoMap).toEqual({});
      scope.done();
    });

    it("☀️ getPendingInfo() resolves to empty object without calling the server", async () => {
      expect(await api.getPendingInfo()).toEqual({});
      expect(nock.pendingMocks()).toEqual([]);
    });

    it("☀️ getPoolInfoMap() resolves to empty map without calling the server", async () => {
      const poolKey: PoolKeyObject = { chainSymbol: "GRL", poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34F" };
      expect(await api.getPoolInfoMap(poolKey)).toEqual({});
      expect(nock.pendingMocks()).toEqual([]);
    });
  });

  describe("Custom headers", () => {
    const customHeaders = { "secret-waf-header": "secret-waf-header-value" };
    const api = new AllbridgeCoreClientImpl(
      new ApiClientImpl({
        coreApiUrl: "http://localhost",
        coreApiHeaders: customHeaders,
      })
    );

    it("☀️ should be present", async () => {
      const nockOptions = { reqheaders: customHeaders }; // cSpell:disable-line
      const scope: nock.Scope = nock("http://localhost", nockOptions).get("/token-info?filter=all").reply(200);

      await api.getChainDetailsMap();

      scope.done();
    });
  });

  describe("Dynamic headers", () => {
    let forwardedFor = "1.1.1.1";

    const api = new AllbridgeCoreClientImpl(
      new ApiClientImpl({
        coreApiUrl: "http://localhost",
        coreApiHeadersProvider: () => Promise.resolve({ "x-forwarded-for": forwardedFor }),
      })
    );

    it("☀️ should be evaluated for every request", async () => {
      let scope: nock.Scope = nock("http://localhost", {
        reqheaders: { "x-forwarded-for": "1.1.1.1" },
      })
        .get("/token-info?filter=all")
        .reply(200, tokenInfoResponse);

      await api.getChainDetailsMap();
      scope.done();

      forwardedFor = "2.2.2.2";
      scope = nock("http://localhost", {
        reqheaders: { "x-forwarded-for": "2.2.2.2" },
      })
        .get("/check/ARB/0x0000000000000000000000000000000000000001")
        .reply(200, { status: AddressStatus.OK, gasBalance: "0" });

      await api.getGasBalance(ChainSymbol.ARB, "0x0000000000000000000000000000000000000001");
      scope.done();
    });

    it("☀️ should not overwrite an explicitly configured x-forwarded-for header", async () => {
      const staticForwardedFor = "1.2.3.4";
      const apiWithStaticHeader = new AllbridgeCoreClientImpl(
        new ApiClientImpl({
          coreApiUrl: "http://localhost",
          coreApiHeaders: { "x-forwarded-for": staticForwardedFor },
          coreApiHeadersProvider: () => Promise.resolve({ "x-forwarded-for": "4.3.2.1" }),
        })
      );

      const scope: nock.Scope = nock("http://localhost", {
        reqheaders: { "x-forwarded-for": staticForwardedFor },
      })
        .get("/token-info?filter=all")
        .reply(200, tokenInfoResponse);

      await apiWithStaticHeader.getChainDetailsMap();

      scope.done();
    });
  });

  describe("given /near-intents endpoints", () => {
    const quoteRequest: NearIntentsQuoteRequest = {
      sourceChainId: 1,
      sourceToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      destinationChainId: 6,
      destinationToken: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      amount: "1000000",
      swapType: "EXACT_INPUT",
    };
    const quoteResponse: NearIntentsQuoteResponse = {
      amountIn: "1000000",
      amountOut: "990000",
      minAmountOut: "980100",
      timeEstimate: 20,
      amountInUsd: "1.00",
      amountOutUsd: "0.99",
      estimated: false,
    };

    afterEach(() => {
      nock.cleanAll();
    });

    it("☀️ getNearIntentsQuote posts the quote request and returns the quote", async () => {
      const scope = nock("http://localhost")
        .post("/near-intents/quote", getRequestBodyMatcher(quoteRequest))
        .reply(200, quoteResponse);
      expect(await api.getNearIntentsQuote(quoteRequest)).toEqual(quoteResponse);
      scope.done();
    });

    it("☀️ createNearIntentsDeposit posts the deposit request and returns the deposit", async () => {
      const depositRequest: NearIntentsDepositRequest = {
        ...quoteRequest,
        recipient: "0x0000000000000000000000000000000000000002",
        refundTo: "0x0000000000000000000000000000000000000001",
      };
      const depositResponse: NearIntentsDepositResponse = {
        depositAddress: "0x00000000000000000000000000000000000000d1",
        amountIn: "1000000",
        amountOut: "990000",
        minAmountOut: "980100",
        deadline: "2030-01-01T00:00:00.000Z",
        timeEstimate: 20,
      };
      const scope = nock("http://localhost")
        .post("/near-intents/deposit", getRequestBodyMatcher(depositRequest))
        .reply(200, depositResponse);
      expect(await api.createNearIntentsDeposit(depositRequest)).toEqual(depositResponse);
      scope.done();
    });

    it("☀️ submitNearIntentsDeposit posts the tx id", async () => {
      const submitRequest = { depositAddress: "0x00000000000000000000000000000000000000d1", txId: "0xabc" };
      const scope = nock("http://localhost")
        .post("/near-intents/deposit/submit", getRequestBodyMatcher(submitRequest))
        .reply(200, {});
      await expect(api.submitNearIntentsDeposit(submitRequest)).resolves.toBeUndefined();
      scope.done();
    });

    it("☁ 400 AMOUNT_TOO_LOW maps to NearIntentsAmountTooLowError with minAmount and minAmountUsd", async () => {
      nock("http://localhost").post("/near-intents/quote").reply(400, {
        code: "AMOUNT_TOO_LOW",
        message: "Amount is too low for bridge, try at least 1500000",
        minAmount: "1500000",
        minAmountUsd: "1000",
      });
      const error = await api.getNearIntentsQuote(quoteRequest).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(NearIntentsAmountTooLowError);
      expect(error).toMatchObject({
        message: "Amount is too low for bridge, try at least 1500000",
        minAmount: "1500000",
        minAmountUsd: "1000",
      });
    });

    it("☁ 400 NO_LIQUIDITY maps to NearIntentsNoLiquidityError", async () => {
      nock("http://localhost")
        .post("/near-intents/quote")
        .reply(400, { code: "NO_LIQUIDITY", message: "No liquidity available" });
      await expect(api.getNearIntentsQuote(quoteRequest)).rejects.toBeInstanceOf(NearIntentsNoLiquidityError);
    });

    it("☁ 400 FAILED_TO_GET_QUOTE maps to NearIntentsQuoteError", async () => {
      nock("http://localhost")
        .post("/near-intents/deposit")
        .reply(400, { code: "FAILED_TO_GET_QUOTE", message: "Failed to get quote" });
      const error = await api
        .createNearIntentsDeposit({ ...quoteRequest, recipient: "r", refundTo: "f" })
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(NearIntentsQuoteError);
      expect(error).toMatchObject({ code: "FAILED_TO_GET_QUOTE", message: "Failed to get quote" });
    });

    it("☁ 502 UPSTREAM_ERROR maps to NearIntentsQuoteError", async () => {
      nock("http://localhost")
        .post("/near-intents/quote")
        .reply(502, { code: "UPSTREAM_ERROR", message: "NEAR Intents is unavailable" });
      const error = await api.getNearIntentsQuote(quoteRequest).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(NearIntentsQuoteError);
      expect(error).toMatchObject({ code: "UPSTREAM_ERROR" });
    });

    it("☁ 502 without body maps to NearIntentsQuoteError", async () => {
      nock("http://localhost").post("/near-intents/quote").reply(502);
      const error = await api.getNearIntentsQuote(quoteRequest).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(NearIntentsQuoteError);
      expect(error).toMatchObject({ code: "UPSTREAM_ERROR" });
    });

    it("☁ 404 maps to NearIntentsDoesNotSupportedError", async () => {
      nock("http://localhost").post("/near-intents/quote").reply(404, { message: "Not Found", statusCode: 404 });
      await expect(api.getNearIntentsQuote(quoteRequest)).rejects.toBeInstanceOf(NearIntentsDoesNotSupportedError);
    });

    it("☁ 400 validation error without code is rethrown as is", async () => {
      nock("http://localhost")
        .post("/near-intents/quote")
        .reply(400, { message: ["amount must be a positive integer string"], statusCode: 400 });
      const error = await api.getNearIntentsQuote(quoteRequest).catch((e: unknown) => e);
      expect(error).toMatchObject({ isAxiosError: true, response: { status: 400 } });
    });
  });
});
