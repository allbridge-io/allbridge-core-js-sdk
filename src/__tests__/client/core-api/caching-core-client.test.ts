import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { AllbridgeCachingCoreClient } from "../../../client/core-api/caching-core-client";
import { Messenger } from "../../../client/core-api/core-api.model";
import { ChainDetailsMap, PoolInfo, PoolInfoMap } from "../../../tokens-info";
import poolInfoGRL from "../../data/pool-info/pool-info-GRL.json";
import poolInfoMap from "../../data/pool-info/pool-info-map.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";

describe("AllbridgeCachingCoreClient", () => {
  let client: AllbridgeCachingCoreClient;
  let apiMock: any;

  beforeEach(() => {
    const ApiMock = vi.fn();
    ApiMock.prototype.getChainDetailsMapAndPoolInfoMap = vi.fn();
    ApiMock.prototype.getTransferStatus = vi.fn();
    ApiMock.prototype.getReceiveTransactionCost = vi.fn();
    ApiMock.prototype.getPoolInfoMap = vi.fn();
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
      apiMock.getChainDetailsMapAndPoolInfoMap.mockResolvedValueOnce({
        chainDetailsMap: expectedChainDetailsMap,
      });
    });

    test("☀ getChainDetailsMap should call api.getChainDetailsMapAndPoolInfoMap()", async () => {
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledOnce();
    });

    test("☀ getChainDetailsMap should cache ChainDetailsMap", async () => {
      await client.getChainDetailsMap();
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledOnce();
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

  describe("Pool Info", () => {
    const poolKeyObject = {
      chainSymbol: ChainSymbol.GRL,
      poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34F",
    };
    const expectedPoolInfoMap = poolInfoMap as unknown as PoolInfoMap;
    const expectedPoolInfo = poolInfoGRL as unknown as PoolInfo;

    beforeEach(() => {
      apiMock.getPoolInfoMap.mockResolvedValue(expectedPoolInfoMap);
    });

    test("☀ getPoolInfoMap should call api.getPoolInfoMap", async () => {
      const actual = await client.getPoolInfoMap(poolKeyObject);
      expect(actual).toEqual(expectedPoolInfoMap);
      expect(apiMock.getPoolInfoMap).toHaveBeenCalledOnce();
    });

    test("☀ getPoolInfoByKey should return Pool Info", async () => {
      const actual = await client.getPoolInfoByKey(poolKeyObject);
      expect(actual).toEqual(expectedPoolInfo);
      expect(apiMock.getPoolInfoMap).toHaveBeenCalledOnce();
    });

    test("☀ getPoolInfoByKey should cache returned Pool Info", async () => {
      await client.getPoolInfoByKey(poolKeyObject);
      const actual = await client.getPoolInfoByKey(poolKeyObject);
      expect(actual).toEqual(expectedPoolInfo);
      expect(apiMock.getPoolInfoMap).toHaveBeenCalledOnce();
    });
  });
});
