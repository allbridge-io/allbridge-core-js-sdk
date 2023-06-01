import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { AllbridgeCachingCoreClient } from "../../../client/core-api/caching-core-client";
import { Messenger } from "../../../client/core-api/core-api.model";
import { ChainDetailsMap, Pool, PoolMap } from "../../../tokens-info";
import poolGRL from "../../data/pool-info/pool-info-GRL.json";
import poolMap from "../../data/pool-info/pool-info-map.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";

describe("AllbridgeCachingCoreClient", () => {
  let client: AllbridgeCachingCoreClient;
  let apiMock: any;

  beforeEach(() => {
    const ApiMock = jest.fn();
    ApiMock.prototype.getChainDetailsMapAndPoolInfoMap = jest.fn();
    ApiMock.prototype.getTransferStatus = jest.fn();
    ApiMock.prototype.getReceiveTransactionCost = jest.fn();
    ApiMock.prototype.getPoolInfoMap = jest.fn();
    apiMock = new ApiMock();
    client = new AllbridgeCachingCoreClient(apiMock as AllbridgeCoreClientImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Given ChainDetailsMap", () => {
    const expectedChainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;
    const expectedPoolInfoMap = poolMap as unknown as PoolMap;

    beforeEach(() => {
      apiMock.getChainDetailsMapAndPoolInfoMap.mockResolvedValueOnce({
        chainDetailsMap: expectedChainDetailsMap,
        poolMap: expectedPoolInfoMap,
      });
    });

    test("☀ getChainDetailsMap should call api.getChainDetailsMapAndPoolMap()", async () => {
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
    });

    describe("Given PoolMap", () => {
      const poolKeyObject = {
        chainSymbol: ChainSymbol.GRL,
        poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34F",
      };
      const expectedPoolInfo = poolGRL as unknown as Pool;

      beforeEach(() => {
        apiMock.getPoolInfoMap.mockResolvedValue(expectedPoolInfoMap);
      });

      test("☀ getPoolByKey should return Pool Info", async () => {
        const actual = await client.getPoolByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
      });

      test("☀ getPoolByKey should cache returned Pool Info", async () => {
        await client.getPoolByKey(poolKeyObject);
        const actual = await client.getPoolByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
      });

      test("☀ refreshPools should call getChainDetailsMapAndPoolMap", async () => {
        await client.refreshPools();
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
      });
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

      expect(apiMock.getTransferStatus).toHaveBeenCalledTimes(1);
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

      expect(apiMock.getReceiveTransactionCost).toHaveBeenCalledTimes(1);
    });
  });
});
