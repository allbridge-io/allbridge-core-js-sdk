import { BridgeService } from "../../../services/bridge";
import { ChainBridgeService } from "../../../services/bridge/models";

export function mockBridgeService_getBridge(bridge: ChainBridgeService) {
  const getBridge = jest.spyOn(BridgeService.prototype as any, "getBridge");
  getBridge.mockImplementation(() => {
    return bridge;
  });
}
