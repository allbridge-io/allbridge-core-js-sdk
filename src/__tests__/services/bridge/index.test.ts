import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { GetTokenBalanceParams, TokenWithChainDetails } from "../../../index";
import { BridgeService } from "../../../services/bridge";
import { SolanaBridgeParams } from "../../../services/bridge/sol";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import { mockBridgeService_getBridge } from "../../mock/bridge";
import { createTestBridge, mockBridge_getTokenBalance } from "../../mock/bridge/models/bridge";

describe("BridgeService", () => {
  let bridgeService: BridgeService;

  beforeEach(() => {
    const apiClient = new AllbridgeCoreClientImpl({
      polygonApiUrl: "",
      coreApiUrl: "coreApiUrl",
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

      const getTokenBalanceParams: GetTokenBalanceParams = {
        account: "account",
        token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      };
      const tokenBalance = await bridgeService.getTokenBalance(getTokenBalanceParams);
      expect(tokenBalance).toEqual("12345.6789");
    });
  });
});
