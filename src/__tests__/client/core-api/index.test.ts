import nock from "nock";
import { ChainSymbol } from "../../../chains/chain.enums";
import { ApiClientImpl } from "../../../client/core-api/api-client";
import {
  AddressStatus,
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClientImpl } from "../../../client/core-api/core-client-base";
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
});
