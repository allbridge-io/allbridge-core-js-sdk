import { TronTokenService } from "../../../../services/token/trx";

export function mockTronTokenContract(methods: any) {
  const bridgeMocked = {
    methods: methods,
  };

  const getContract = jest.spyOn(TronTokenService.prototype as any, "getContract");
  getContract.mockImplementation(() => {
    return bridgeMocked;
  });
}

export function mockTronVerifyTx() {
  const verifyTxMocked = jest.spyOn(TronTokenService.prototype as any, "verifyTx");
  verifyTxMocked.mockImplementation(() => {
    return;
  });
  return verifyTxMocked;
}
