import { vi } from "vitest";
import { TronBridge } from "../../../../bridge/trx";

export function mockTronContract(methods: any) {
  const bridgeMocked = {
    methods: methods,
  };

  const getContract = vi.spyOn(TronBridge.prototype as any, "getContract");
  getContract.mockImplementation(() => {
    return bridgeMocked;
  });
}

export function mockTronVerifyTx() {
  const verifyTxMocked = vi.spyOn(TronBridge.prototype as any, "verifyTx");
  verifyTxMocked.mockImplementation(() => {
    return;
  });
  return verifyTxMocked;
}
