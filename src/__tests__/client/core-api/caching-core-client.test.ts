import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { AllbridgeCachingCoreClient } from "../../../client/core-api/caching-core-client";
import { Messenger } from "../../../client/core-api/core-api.model";
import { ChainDetailsMap } from "../../../tokens-info";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";

describe("AllbridgeCachingCoreClient", () => {
  let client: AllbridgeCachingCoreClient;
  let apiMock: any;

  beforeEach(() => {
    const ApiMock = vi.fn();
    ApiMock.prototype.getChainDetailsMap = vi.fn();
    ApiMock.prototype.getTransferStatus = vi.fn();
    ApiMock.prototype.getReceiveTransactionCost = vi.fn();
    apiMock = new ApiMock();
    client = new AllbridgeCachingCoreClient(apiMock as AllbridgeCoreClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("chainDetailsMap", () => {
    const expectedChainDetailsMap =
      tokensGroupedByChain as unknown as ChainDetailsMap;

    beforeEach(() => {
      apiMock.getChainDetailsMap.mockResolvedValueOnce(expectedChainDetailsMap);
    });

    test("☀ getChainDetailsMap should call api.getChainDetailsMap()", async () => {
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMap).toHaveBeenCalledOnce();
    });

    test("☀ getChainDetailsMap should cache calls to api.getChainDetailsMap()", async () => {
      await client.getChainDetailsMap();
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMap).toHaveBeenCalledOnce();
    });
  });

  describe("getTransferStatus", () => {
    const expected = "expected";

    beforeEach(() => {
      apiMock.getTransferStatus.mockResolvedValueOnce(expected);
    });

    test("☀ getTransferStatus should call api.getTransferStatus", async () => {
      const actual = await client.getTransferStatus(ChainSymbol.GRL, "txId");
      expect(actual).toEqual(expected);

      expect(apiMock.getTransferStatus).toHaveBeenCalledOnce();
    });
  });

  describe("getReceiveTransactionCost", () => {
    const expected = "expected";

    beforeEach(() => {
      apiMock.getReceiveTransactionCost.mockResolvedValueOnce(expected);
    });

    test("☀ getReceiveTransactionCost should call api.getReceiveTransactionCost", async () => {
      const actual = await client.getReceiveTransactionCost({
        destinationChainId: 0,
        messenger: Messenger.ALLBRIDGE,
        sourceChainId: 0,
      });
      expect(actual).toEqual(expected);

      expect(apiMock.getReceiveTransactionCost).toHaveBeenCalledOnce();
    });
  });
});
