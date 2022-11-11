import nock, { Body, RequestBodyMatcher } from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import {
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "../../../client/core-api/core-api.model";
import { ChainDetailsMap } from "../../../tokens-info";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";
import transferStatus from "../../data/transfer-status/TransferStatus.json";
import transferStatusResponse from "../../mock/core-api/send-status.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";

const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;
const expectedTransferStatus =
  transferStatus as unknown as TransferStatusResponse;

describe("AllbridgeCoreClient", () => {
  const api = new AllbridgeCoreClientImpl({ apiUrl: "http://localhost" });

  describe("given /token-info endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost")
        .get("/token-info")
        .reply(200, tokenInfoResponse);
    });

    it("☀️ getChainDetailsMap() returns ChainDetailsMap", async () => {
      expect(await api.getChainDetailsMap()).toEqual(
        expectedTokensGroupedByChain
      );
      scope.done();
    });
  });

  describe("given /chain/ChainSymbol/txId endpoint", () => {
    const chainSymbol = ChainSymbol.TRX;
    const txId =
      "0417a44b76793d32c316c1e8d05de99f5929e07415a4a87e4e858cf371ef467a";
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost")
        .get(`/chain/${chainSymbol}/${txId}`)
        .reply(200, transferStatusResponse);
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
    const receiveFeeRequest: ReceiveTransactionCostRequest = {
      sourceChainId: 2,
      destinationChainId: 4,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeResponse: ReceiveTransactionCostResponse = { fee };

    beforeEach(() => {
      scope = nock("http://localhost")
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
        .reply(201, receiveFeeResponse);
    });

    it("☀️ getReceiveTransactionCost returns fee", async () => {
      const actual = await api.getReceiveTransactionCost(receiveFeeRequest);
      expect(actual).toEqual(fee);
      scope.done();
    });
  });
});

function getRequestBodyMatcher(
  expectedBody: ReceiveTransactionCostRequest
): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}
