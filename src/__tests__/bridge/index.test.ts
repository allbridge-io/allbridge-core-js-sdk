import { beforeEach, describe, expect, test } from "vitest";
import { BridgeService } from "../../bridge";
import { SolanaBridgeParams } from "../../bridge/sol";
import { AllbridgeCoreClientImpl } from "../../client/core-api";
import { GetTokenBalanceParamsWithTokenAddress } from "../../index";
import { mockBridgeService_getBridge } from "../mock/bridge";
import {
  createTestBridge,
  mockBridge_getTokenBalance,
} from "../mock/bridge/models/bridge";

describe("BridgeService", () => {
  let bridgeService: BridgeService;

  beforeEach(() => {
    const apiClient = new AllbridgeCoreClientImpl({
      apiUrl: "apiUrl",
    });
    const solParams: SolanaBridgeParams = {
      solanaRpcUrl: "solanaRpcUrl",
      wormholeMessengerProgramId: "wormholeMessengerProgramId",
    };
    bridgeService = new BridgeService(apiClient, solParams);
  });

  describe("getTokenBalance", () => {
    test("getTokenBalance should return in token precision, when parameter has tokenDecimals", async () => {
      const mockBridge = createTestBridge();
      mockBridgeService_getBridge(mockBridge);
      mockBridge_getTokenBalance(mockBridge, "1234567890");

      const getTokenBalanceParams: GetTokenBalanceParamsWithTokenAddress = {
        account: "account",
        tokenAddress: "tokenAddress",
        tokenDecimals: 5,
      };
      const tokenBalance = await bridgeService.getTokenBalance(
        getTokenBalanceParams
      );
      expect(tokenBalance).toEqual("12345.6789");
    });
  });
});
