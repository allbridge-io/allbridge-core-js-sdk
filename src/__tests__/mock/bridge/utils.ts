import { vi } from "vitest";
import * as UtilsModule from "../../../bridge/utils";

export function mockNonce() {
  const nonceSpy = vi.spyOn(UtilsModule, "getNonce");
  const nonceBuffer = Buffer.from(
    "3b1200153e110000001b006132000000000000000000362600611e000000070c",
    "hex"
  );
  nonceSpy.mockImplementation(() => nonceBuffer);
  return nonceBuffer;
}
