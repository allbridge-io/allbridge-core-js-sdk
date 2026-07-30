import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { RawTransaction } from "../../models";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalanceInfo } from "./pool.model";

/**
 * @deprecated Do not use.
 */
export abstract class ChainPoolService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  /** @deprecated Do not use. */
  abstract getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo>;

  /** @deprecated Do not use. */
  abstract getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo>;

  /** @deprecated Do not use. */
  abstract buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  /** @deprecated Do not use. */
  abstract buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction>;

  /** @deprecated Do not use. */
  abstract buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction>;
}
