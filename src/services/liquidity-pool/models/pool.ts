import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { RawTransaction } from "../../models";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalanceInfo } from "./pool.model";

export abstract class ChainPoolService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  abstract getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo>;

  abstract getPoolInfo(token: TokenWithChainDetails): Promise<PoolInfo>;

  abstract buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  abstract buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  abstract buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction>;
}
