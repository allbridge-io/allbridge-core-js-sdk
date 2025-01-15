import { EvmTokenService } from "../../../../services/token/evm";

export function mockEvmTokenContract(methods: any) {
  const contractMocked = {
    methods: methods,
  };

  const methodGetContract = jest.spyOn(EvmTokenService.prototype as any, "getERC20Contract");
  methodGetContract.mockImplementation(() => {
    return contractMocked;
  });
}

export function mockEvmSendRawTransaction(transactionHash: string) {
  const methodSendRawTransaction = jest.spyOn(EvmTokenService.prototype as any, "sendRawTransaction");
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
