/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { vi } from "vitest";
import { EvmBridge } from "../../../../bridge/evm";

export function mockEvmContract(methods: any) {
  const contractMocked = {
    methods: methods,
  };

  const methodGetContract = vi.spyOn(EvmBridge.prototype as any, "getContract");
  methodGetContract.mockImplementation(() => {
    return contractMocked;
  });
}
