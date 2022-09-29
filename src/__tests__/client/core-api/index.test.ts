import nock, { Body, RequestBodyMatcher } from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { AllbridgeCoreClient } from "../../../client/core-api";
import {
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../../../client/core-api/core-api.model";
import { ChainDetailsMap } from "../../../tokens-info";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";
const expectedTokensGroupedByChain =
  tokensGroupedByChain as unknown as ChainDetailsMap;

describe("AllbridgeCoreClient", () => {
  const api = new AllbridgeCoreClient({ apiUrl: "http://localhost" });

  describe("given /token-info endpoint", () => {
    let scope: nock.Scope;

    beforeEach(() => {
      scope = nock("http://localhost")
        .get("/token-info")
        .reply(200, tokenInfoResponse);
    });

    it("☀️ getTokensInfo() returns TokensInfo", async () => {
      const actual = await api.getTokensInfo();
      expect(actual.chainDetailsMap()).toEqual(expectedTokensGroupedByChain);
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
