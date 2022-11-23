import { vi } from "vitest";
import { BridgeService } from "../../../bridge";
import { Bridge } from "../../../bridge/models";

export const mockedTokenBalance = "1234567890";

export function mockBridgeService_getTokenBalance() {
  const tokenBalance = vi.spyOn(
    BridgeService.prototype as any,
    "getTokenBalance"
  );
  tokenBalance.mockImplementation(() => {
    return mockedTokenBalance;
  });
}

export function mockBridgeService_getBridge(bridge: Bridge) {
  const getBridge = vi.spyOn(BridgeService.prototype as any, "getBridge");
  getBridge.mockImplementation(() => {
    return bridge;
  });
}
