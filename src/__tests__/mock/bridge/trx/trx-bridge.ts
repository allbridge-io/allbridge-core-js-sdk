import { TronBridgeService } from "../../../../services/bridge/trx";

export function mockTronBridgeContract(methods: any) {
  const bridgeMocked = {
    methods: methods,
  };

  const getContract = jest.spyOn(TronBridgeService.prototype as any, "getContract");
  getContract.mockImplementation(() => {
    return bridgeMocked;
  });
}

export function mockTronVerifyTx() {
  const verifyTxMocked = jest.spyOn(TronBridgeService.prototype as any, "verifyTx");
  verifyTxMocked.mockImplementation(() => {
    return;
  });
  return verifyTxMocked;
}
