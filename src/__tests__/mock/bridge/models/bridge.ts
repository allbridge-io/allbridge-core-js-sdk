/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
import { ChainType } from "../../../../chains/chain.enums";
import { AllbridgeCoreClient, AllbridgeCoreClientWithPoolInfo } from "../../../../client/core-api/core-client-base";
import {
  ApproveParams,
  ChainBridgeService,
  GetAllowanceParamsDto,
  GetTokenBalanceParams,
  SendParams,
  SwapParams,
  TxSendParams,
} from "../../../../services/bridge/models";
import { SolanaBridgeParams } from "../../../../services/bridge/sol";
import { RawTransaction, TransactionResponse } from "../../../../services/models";

export class TestBridge extends ChainBridgeService {
  constructor(
    public params: SolanaBridgeParams,
    public api: AllbridgeCoreClient,
    public chainType: ChainType,
  ) {
    super();
  }

  approve(approveData: ApproveParams): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionApprove(approveData: ApproveParams): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    return Promise.resolve("");
  }

  getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    return Promise.resolve("");
  }

  sendTx(params: TxSendParams): Promise<TransactionResponse> {
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    return Promise.resolve("");
  }

  send(params: SendParams): Promise<TransactionResponse> {
    return Promise.resolve({ txId: "txId" });
  }
}
