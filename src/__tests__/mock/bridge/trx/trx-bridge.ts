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
