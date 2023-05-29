import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
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
    const expectedPoolInfoMap = poolInfoMap as unknown as PoolInfoMap;

    beforeEach(() => {
      apiMock.getChainDetailsMapAndPoolInfoMap.mockResolvedValueOnce({
        chainDetailsMap: expectedChainDetailsMap,
        poolInfoMap: expectedPoolInfoMap,
      });
    });

    test("☀ getChainDetailsMap should call api.getChainDetailsMapAndPoolInfoMap()", async () => {
      const actual = await client.getChainDetailsMap();
      expect(actual).toEqual(expectedChainDetailsMap);

      expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
    });

    describe("Given PoolInfoMap", () => {
      const poolKeyObject = {
        chainSymbol: ChainSymbol.GRL,
        poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34F",
      };
      const expectedPoolInfo = poolInfoGRL as unknown as PoolInfo;

      beforeEach(() => {
        apiMock.getPoolInfoMap.mockResolvedValue(expectedPoolInfoMap);
      });

      test("☀ getPoolInfoByKey should return Pool Info", async () => {
        const actual = await client.getPoolInfoByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
      });

      test("☀ getPoolInfoByKey should cache returned Pool Info", async () => {
        await client.getPoolInfoByKey(poolKeyObject);
        const actual = await client.getPoolInfoByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
      });

      test("☀ refreshPoolInfo should call getChainDetailsMapAndPoolInfoMap", async () => {
        await client.refreshPoolInfo();
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
