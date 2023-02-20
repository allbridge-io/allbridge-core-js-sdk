import { PoolInfo, TokenInfoWithChainDetails } from "../../../tokens-info";
import { convertIntAmountToFloat, getEarned } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";

export interface LiquidityPoolsParams {
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenInfoWithChainDetails |The token info object} of operation token.
   */
  token: TokenInfoWithChainDetails;
}

export interface LiquidityPoolsParamsWithAmount extends LiquidityPoolsParams {
  /**
   * The float amount of tokens.
   */
  amount: string;
}

export interface UserBalanceInfoDTO {
  lpAmount: string;
  rewardDebt: string;
}

export class UserBalanceInfo implements UserBalanceInfoDTO {
  lpAmount: string;
  rewardDebt: string;

  constructor(userInfo: UserBalanceInfoDTO) {
    this.lpAmount = userInfo.lpAmount;
    this.rewardDebt = userInfo.rewardDebt;
  }

  get userLiquidity(): string {
    return convertIntAmountToFloat(this.lpAmount, SYSTEM_PRECISION).toFixed();
  }

  earned(poolInfo: PoolInfo, decimals?: number): string {
    const earned = getEarned(
      this.lpAmount,
      this.rewardDebt,
      poolInfo.accRewardPerShareP,
      poolInfo.p
    );
    if (decimals) {
      return convertIntAmountToFloat(earned, decimals).toString();
    }
    return earned;
  }
}
