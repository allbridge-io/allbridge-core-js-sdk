import { Big } from "big.js";
import { FeePaymentMethod, TxFeeParams } from "../../../models";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { convertIntAmountToFloat, getEarned } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";

/**
 * @deprecated Do not use.
 */
export interface ApproveParams {
  /**
   * The token info
   */
  token: TokenWithChainDetails;

  /**
   *  The address of the token owner who is granting permission to use tokens
   */
  owner: string;

  /**
   * The integer amount of tokens to approve.
   * Optional.
   * The maximum amount by default.
   */
  amount?: string | number | Big;
}

/**
 * @deprecated Do not use.
 */
export interface GetAllowanceParams {
  token: TokenWithChainDetails;
  owner: string;
  gasFeePaymentMethod?: FeePaymentMethod;
}

/**
 * @deprecated Do not use.
 */
export type GetAllowanceParamsDto = GetAllowanceParams;

/**
 * @deprecated Do not use.
 */
export interface CheckAllowanceParams extends GetAllowanceParams {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

/**
 * @deprecated Do not use.
 */
export interface LiquidityPoolsParams {
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenWithChainDetails |The token info object} of operation token.
   */
  token: TokenWithChainDetails;

  txFeeParams?: TxFeeParams;
}

/**
 * @deprecated Do not use.
 */
export interface LiquidityPoolsParamsWithAmount extends LiquidityPoolsParams {
  /**
   * The float amount of tokens.
   */
  amount: string;
}

/**
 * @deprecated Do not use.
 */
export interface UserBalanceInfoDTO {
  lpAmount: string;
  rewardDebt: string;
}

/**
 * @deprecated Do not use.
 */
export interface UserBalanceInfo extends UserBalanceInfoDTO {
  userLiquidity: string;

  earned(poolInfo: PoolInfo, decimals?: number): string;
}

/**
 * @deprecated Do not use.
 */
export class UserBalance implements UserBalanceInfo {
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
    const earned = getEarned(this.lpAmount, this.rewardDebt, poolInfo.accRewardPerShareP, poolInfo.p);
    if (decimals) {
      return convertIntAmountToFloat(earned, decimals).toFixed();
    }
    return earned;
  }
}
