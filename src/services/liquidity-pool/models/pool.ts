import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { PoolInfo, TokenInfoWithChainDetails } from "../../../tokens-info";
import { RawTransaction } from "../../models";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalanceInfo } from "./pool.model";

export abstract class Pool {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  abstract getUserBalanceInfo(accountAddress: string, token: TokenInfoWithChainDetails): Promise<UserBalanceInfo>;

  abstract getPoolInfo(token: TokenInfoWithChainDetails): Promise<PoolInfo>;

  abstract buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  abstract buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  abstract buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction>;
}
