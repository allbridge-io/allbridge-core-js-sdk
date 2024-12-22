import { EvmBridgeService } from "../../../../services/bridge/evm";
import { EvmTokenService } from "../../../../services/token/evm";

export function mockEvmBridgeContract(methods: any) {
  const contractMocked = {
    methods: methods,
  };

  const methodGetContract = jest.spyOn(EvmBridgeService.prototype as any, "getBridgeContract");
  methodGetContract.mockImplementation(() => {
    return contractMocked;
  });
}

export function mockEvmCctpBridgeContract(methods: any) {
  const contractMocked = {
    methods: methods,
  };

  const methodGetContract = jest.spyOn(EvmBridgeService.prototype as any, "getCctpBridgeContract");
  methodGetContract.mockImplementation(() => {
    return contractMocked;
  });
}

export function mockEvmSendRawTransaction(transactionHash: string) {
  const methodSendRawTransaction = jest.spyOn(EvmBridgeService.prototype as any, "sendRawTransaction");
  methodSendRawTransaction.mockImplementation(() => {
    return { txId: transactionHash };
  });
  return methodSendRawTransaction;
}

export function mockGetAllowanceByTokenAddress(allowance: string) {
  // prettier-ignore
  return jest.spyOn(EvmTokenService.prototype, "getAllowanceByTokenAddress")
    /* eslint-disable-next-line @typescript-eslint/require-await */
    .mockImplementation(async () => {
      return allowance;
    });
}
