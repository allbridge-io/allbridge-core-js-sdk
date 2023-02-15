import { Big } from "big.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction } from "../../models";
import { prepareTxSendParams } from "../utils";
import {
  ApproveParamsDto,
  CheckAllowanceParamsDto,
  GetAllowanceParamsDto,
  GetTokenBalanceParamsWithTokenAddress,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
  TxSendParams,
} from "./bridge.model";

export abstract class Bridge {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  abstract getTokenBalance(
    params: GetTokenBalanceParamsWithTokenAddress
  ): Promise<string>;

  abstract getAllowance(params: GetAllowanceParamsDto): Promise<string>;

  async checkAllowance(params: CheckAllowanceParamsDto): Promise<boolean> {
    const allowance = await this.getAllowance(params);
    return Big(allowance).gte(Big(params.amount));
  }

  async send(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    const txSendParams = await prepareTxSendParams(
      this.chainType,
      params,
      this.api
    );
    return this.sendTx(txSendParams);
  }

  abstract sendTx(params: TxSendParams): Promise<TransactionResponse>;

  abstract buildRawTransactionSend(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<RawTransaction>;

  abstract approve(params: ApproveParamsDto): Promise<TransactionResponse>;

  abstract buildRawTransactionApprove(
    params: ApproveParamsDto
  ): Promise<RawTransaction>;
}
