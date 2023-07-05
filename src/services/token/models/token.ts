import { Big } from "big.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction, TransactionResponse } from "../../models";
import { ApproveParamsDto, CheckAllowanceParamsDto, GetAllowanceParamsDto, GetTokenBalanceParams } from "./token.model";

export abstract class ChainTokenService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  abstract getTokenBalance(params: GetTokenBalanceParams): Promise<string>;

  abstract getAllowance(params: GetAllowanceParamsDto): Promise<string>;

  async checkAllowance(params: CheckAllowanceParamsDto): Promise<boolean> {
    const allowance = await this.getAllowance(params);
    return Big(allowance).gte(Big(params.amount));
  }

  abstract approve(params: ApproveParamsDto): Promise<TransactionResponse>;

  abstract buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction>;
}
