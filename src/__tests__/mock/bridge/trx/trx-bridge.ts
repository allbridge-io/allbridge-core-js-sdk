import { TronBridge } from "../../../../services/bridge/trx";

export function mockTronContract(methods: any) {
  const bridgeMocked = {
    methods: methods,
  };

  const getContract = jest.spyOn(TronBridge.prototype as any, "getContract");
  getContract.mockImplementation(() => {
    return bridgeMocked;
  });
}

export function mockTronVerifyTx() {
  const verifyTxMocked = jest.spyOn(TronBridge.prototype as any, "verifyTx");
  verifyTxMocked.mockImplementation(() => {
    return;
  });
  return verifyTxMocked;
}
