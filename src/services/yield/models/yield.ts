import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { RawTransaction } from "../../models";
import {
  YieldBalanceParams,
  YieldDepositParams,
  YieldGetEstimatedAmountOnDepositParams,
  YieldGetWithdrawProportionAmountParams,
  YieldWithdrawParams,
} from "./yield.model";

export abstract class ChainYieldService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  abstract balanceOf(params: YieldBalanceParams): Promise<string>;

  abstract getEstimatedAmountOnDeposit(params: YieldGetEstimatedAmountOnDepositParams): Promise<string>;

  abstract getWithdrawProportionAmount(params: YieldGetWithdrawProportionAmountParams): Promise<string[]>;

  abstract buildRawTransactionDeposit(params: YieldDepositParams): Promise<RawTransaction>;

  abstract buildRawTransactionWithdraw(params: YieldWithdrawParams): Promise<RawTransaction>;
}
