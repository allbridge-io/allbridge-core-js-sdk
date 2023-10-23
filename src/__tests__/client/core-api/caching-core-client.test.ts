import { ChainSymbol } from "../../../chains";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClientPoolInfoCaching } from "../../../client/core-api/core-client-pool-info-caching";
import { ChainDetailsMap, PoolInfo, PoolInfoMap } from "../../../tokens-info";
import poolGRL from "../../data/pool-info/pool-info-GRL.json";
import poolMap from "../../data/pool-info/pool-info-map.json";
import tokensGroupedByChain from "../../data/tokens-info/ChainDetailsMap.json";

describe("AllbridgeCachingCoreClient", () => {
  let client: AllbridgeCoreClientPoolInfoCaching;
  let apiMock: any;

  beforeEach(() => {
    const ApiMock = jest.fn();
    ApiMock.prototype.getChainDetailsMapAndPoolInfoMap = jest.fn();
    ApiMock.prototype.getTransferStatus = jest.fn();
    ApiMock.prototype.getReceiveTransactionCost = jest.fn();
    ApiMock.prototype.getPoolInfoMap = jest.fn();
    apiMock = new ApiMock();
    client = new AllbridgeCoreClientPoolInfoCaching(apiMock as AllbridgeCoreClientImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Given ChainDetailsMap", () => {
    const expectedChainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;
    const expectedPoolInfoMap = poolMap as unknown as PoolInfoMap;

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
      const poolKeyObject2 = {
        chainSymbol: ChainSymbol.GRL,
        poolAddress: "0x227e10f9E750C922bf9dee7620B58033F566b34F",
      };
      const poolKeyObjectNotInCash = {
        chainSymbol: ChainSymbol.GRL,
        poolAddress: "0x727e10f9E750C922bf9dee7620B58033F566b34A",
      };
      const expectedPoolInfo = poolGRL as unknown as PoolInfo;

      beforeEach(() => {
        apiMock.getPoolInfoMap.mockResolvedValue(expectedPoolInfoMap);
      });

      test("☀ getPoolInfoByKey should return PoolInfo Info", async () => {
        const actual = await client.getPoolInfoByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
      });

      test("☀ getPoolInfoByKey should request not cashed from pool-info request", async () => {
        await client.getPoolInfoByKey(poolKeyObjectNotInCash);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObjectNotInCash);
      });

      test("☀ getPoolInfoByKey should cache returned PoolInfo Info", async () => {
        await client.getPoolInfoByKey(poolKeyObject);
        const actual = await client.getPoolInfoByKey(poolKeyObject);
        expect(actual).toEqual(expectedPoolInfo);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(0);
      });

      test("☀ refreshPoolInfo should call getChainDetailsMapAndPoolInfoMap", async () => {
        await client.refreshPoolInfo();
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
      });

      test("☀ refreshPoolInfo with poolKeyObject should call getPoolInfoMap", async () => {
        await client.refreshPoolInfo(poolKeyObject);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
      });

      test("☀ refreshPoolInfo with poolKeyObject should call getChainDetailsMapAndPoolInfoMap only in cash init", async () => {
        await client.refreshPoolInfo(poolKeyObject);
        await client.refreshPoolInfo(poolKeyObject);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(2);
        expect(apiMock.getPoolInfoMap).toBeCalledWith(poolKeyObject);
        expect(apiMock.getChainDetailsMapAndPoolInfoMap).toHaveBeenCalledTimes(1);
      });

      test("☀ refreshPoolInfo with poolKeyObjects[] should call getPoolInfoMap", async () => {
        await client.refreshPoolInfo([poolKeyObject, poolKeyObject2]);
        expect(apiMock.getPoolInfoMap).toHaveBeenCalledTimes(1);
        expect(apiMock.getPoolInfoMap).toBeCalledWith([poolKeyObject, poolKeyObject2]);
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
