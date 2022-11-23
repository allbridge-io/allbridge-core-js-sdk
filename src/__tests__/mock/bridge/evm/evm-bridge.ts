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

export function mockEvmSendRawTransaction(transactionHash: string) {
  const methodSendRawTransaction = vi.spyOn(
    EvmBridge.prototype as any,
    "sendRawTransaction"
  );
  methodSendRawTransaction.mockImplementation(() => {
    return { txId: transactionHash };
  });
  return methodSendRawTransaction;
}
