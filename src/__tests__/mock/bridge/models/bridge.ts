/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */

import { ChainType } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import {
  ApproveParamsDto,
  Bridge,
  GetAllowanceParamsDto, GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithTokenInfos,
  TransactionResponse,
  TxSendParams,
} from "../../../../services/bridge/models";
import { SolanaBridgeParams } from "../../../../services/bridge/sol";
import { RawTransaction } from "../../../../services/models";

export function createTestBridge(): Bridge {
  // @ts-expect-error
  return new TestBridge(undefined, undefined, undefined);
}

export function mockBridge_getTokenBalance(bridge: Bridge, tokenBalance: string) {
  const getTokenBalance = jest.spyOn(bridge, "getTokenBalance");
  getTokenBalance.mockImplementation(() => {
    return Promise.resolve(tokenBalance);
  });
}

export class TestBridge extends Bridge {
  constructor(public params: SolanaBridgeParams, public api: AllbridgeCoreClient, public chainType: ChainType) {
    super();
  }

  approve(approveData: ApproveParamsDto): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionApprove(approveData: ApproveParamsDto): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionSend(params: SendParamsWithTokenInfos): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    return Promise.resolve("");
  }

  getTokenBalance(params: GetTokenBalanceParamsWithTokenInfo): Promise<string> {
    return Promise.resolve("");
  }

  sendTx(params: TxSendParams): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }
}
