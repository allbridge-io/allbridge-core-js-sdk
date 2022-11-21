/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */

import { vi } from "vitest";
import {
  ApproveData,
  Bridge,
  GetAllowanceParamsDto,
  GetTokenBalanceParamsWithTokenAddress,
  RawTransaction,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
  TxSendParams,
} from "../../../../bridge/models";
import { SolanaBridgeParams } from "../../../../bridge/sol";
import { ChainType } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";

export function createTestBridge(): Bridge {
  // @ts-expect-error
  return new TestBridge(undefined, undefined, undefined);
}

export function mockBridge_getTokenBalance(
  bridge: Bridge,
  tokenBalance: string
) {
  const getTokenBalance = vi.spyOn(bridge, "getTokenBalance");
  getTokenBalance.mockImplementation(() => {
    return Promise.resolve(tokenBalance);
  });
}

export class TestBridge extends Bridge {
  constructor(
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient,
    public chainType: ChainType
  ) {
    super();
  }

  approve(approveData: ApproveData): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionApprove(
    approveData: ApproveData
  ): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionSend(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    return Promise.resolve("");
  }

  getTokenBalance(
    params: GetTokenBalanceParamsWithTokenAddress
  ): Promise<string> {
    return Promise.resolve("");
  }

  sendTx(params: TxSendParams): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }
}
