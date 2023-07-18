import nock from "nock";
import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { ApiClientImpl } from "../../../client/core-api/api-client";
import {
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "../../../client/core-api/core-api.model";
import { ChainDetailsMap, PoolInfoMap, PoolKeyObject } from "../../../tokens-info";
import poolMap from "../../data/pool-info/pool-info-map.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";
import transferStatus from "../../data/transfer-status/TransferStatus.json";
import poolResponse from "../../mock/core-api/pool-info.json";
import transferStatusResponse from "../../mock/core-api/send-status.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";
import polygonApiUrlResponse from "../../mock/polygon-api/polygon-api.json";
import { getRequestBodyMatcher } from "../../mock/utils";

const expectedTokensGroupedByChain = tokensGroupedByChain as unknown as ChainDetailsMap;
const expectedTransferStatus = transferStatus as unknown as TransferStatusResponse;

describe("AllbridgeCoreClient", () => {
  const POLYGON_API_URL = "http://localhost/pol";
  const api = new AllbridgeCoreClientImpl(
    new ApiClientImpl({
      coreApiUrl: "http://localhost",
      polygonGasStationUrl: POLYGON_API_URL,
    })
  );

  describe("given /token-info endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost").get("/token-info").reply(200, tokenInfoResponse);
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
      expect(actual).toEqual({
        exchangeRate: "0.12550590438537169016",
        fee: "20000000000000000",
        sourceNativeTokenPrice: "1501",
      });
      scope.done();
    });
  });

  describe("given /poolInfo-info endpoint", () => {
    let scope: nock.Scope;

    const poolKey: PoolKeyObject = {
      chainSymbol: ChainSymbol.GRL,
      poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34F",
    };

    beforeEach(() => {
      scope = nock("http://localhost")
        .post("/pool-info", getRequestBodyMatcher({ pools: [poolKey] }))
        .reply(201, poolResponse);
    });

    it("☀️ getPoolInfoMap() returns PoolInfoMap", async () => {
      const expectedPoolInfoMap = poolMap as unknown as PoolInfoMap;

      const actual = await api.getPoolInfoMap([poolKey]);
      expect(actual).toEqual(expectedPoolInfoMap);

      scope.done();
    });
  });

  describe("Custom headers", () => {
    const customHeaders = { "secret-waf-header": "secret-waf-header-value" };
    const api = new AllbridgeCoreClientImpl(
      new ApiClientImpl({
        coreApiUrl: "http://localhost",
        polygonGasStationUrl: POLYGON_API_URL,
        coreApiHeaders: customHeaders,
      })
    );

    it("☀️ should be present", async () => {
      const nockOptions = { reqheaders: customHeaders }; // cSpell:disable-line
      const scope: nock.Scope = nock("http://localhost", nockOptions).get("/token-info").reply(200);

      await api.getChainDetailsMap();

      scope.done();
    });
  });
});
