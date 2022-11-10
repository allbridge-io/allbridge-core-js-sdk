import { Big } from "big.js";
import { ChainType } from "../../chains";
import {
  ApproveData,
  CheckAllowanceParamsDto,
  GetAllowanceParamsDto,
  GetTokenBalanceData,
  RawTransaction,
  TransactionResponse,
  TxSendParams,
} from "./bridge.model";

export abstract class Bridge {
  abstract chainType: ChainType;

  abstract getTokenBalance(data: GetTokenBalanceData): Promise<string>;

  abstract getAllowance(params: GetAllowanceParamsDto): Promise<string>;

  async checkAllowance(params: CheckAllowanceParamsDto): Promise<boolean> {
    const allowance = await this.getAllowance(params);
    return Big(allowance).gte(Big(params.amount));
  }

  abstract sendTx(params: TxSendParams): Promise<TransactionResponse>;

  abstract buildRawTransactionSend(
    params: TxSendParams
  ): Promise<RawTransaction>;

  abstract approve(approveData: ApproveData): Promise<TransactionResponse>;

  abstract buildRawTransactionApprove(
    approveData: ApproveData
  ): Promise<RawTransaction>;
}
