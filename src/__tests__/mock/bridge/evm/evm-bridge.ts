import { EvmBridgeService } from "../../../../services/bridge/evm";
import { EvmTokenService } from "../../../../services/token/evm";

export function mockEvmContract(methods: any) {
  const contractMocked = {
    methods: methods,
  };

  const methodGetContract = jest.spyOn(EvmBridgeService.prototype as any, "getContract");
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
    /* eslint-disable-next-line @typescript-eslint/require-await,@typescript-eslint/no-misused-promises */
    .mockImplementation(async () => {
      return allowance;
    });
}
