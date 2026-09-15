import { Big } from "big.js";
import { TokenWithChainDetails } from "../../../tokens-info";

/**
 * @deprecated Do not use.
 */
export type TokenWithChainDetailsYield = TokenWithChainDetails & {
  yieldAddress: string;
  yieldId: string;
};

/**
 * @deprecated Do not use.
 */
export interface CYDToken extends TokenWithChainDetails {
  yieldAddress: string;
  tokens: TokenWithChainDetailsYield[];
}

/**
 * @deprecated Do not use.
 */
export interface YieldGetAllowanceParams {
  token: TokenWithChainDetailsYield;
  owner: string;
}

/**
 * @deprecated Do not use.
 */
export interface YieldCheckAllowanceParams extends YieldGetAllowanceParams {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

/**
 * @deprecated Do not use.
 */
export interface YieldBalanceParams {
  owner: string;
  token: Pick<CYDToken, "chainSymbol" | "yieldAddress">;
}

/**
 * @deprecated Do not use.
 */
export interface YieldGetEstimatedAmountOnDepositParams {
  /**
   * The float amount of tokens to deposit.
   */
  amount: string;
  token: TokenWithChainDetailsYield;
}

/**
 * @deprecated Do not use.
 */
export interface YieldGetWithdrawProportionAmountParams {
  /**
   * The float amount of tokens to withdraw.
   */
  amount: string;
  owner: string;
  cydToken: Pick<CYDToken, "chainSymbol" | "yieldAddress" | "tokens">;
}

/**
 * @deprecated Do not use.
 */
export interface YieldWithdrawAmount {
  /**
   * The float amount of tokens to be withdrawn.
   */
  amount: string;
  token: TokenWithChainDetailsYield;
}

/**
 * @deprecated Do not use.
 */
export interface YieldApproveParams {
  /**
   * The token info
   */
  token: TokenWithChainDetailsYield;

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
export interface YieldDepositParams {
  /**
   * The account address to operate tokens with.
   */
  owner: string;
  /**
   * {@link TokenWithChainDetailsYield} operation token.
   */
  token: TokenWithChainDetailsYield;

  /**
   * The float amount of tokens.
   */
  amount: string;
  /**
   * The Minimum float amount of CYD tokens.
   */
  minVirtualAmount: string;
}

/**
 * @deprecated Do not use.
 */
export interface YieldWithdrawParams {
  /**
   * The account address to operate tokens with.
   */
  owner: string;
  /**
   * {@link TokenWithChainDetailsYield} operation token.
   */
  token: CYDToken;

  /**
   * The float amount of tokens.
   */
  amount: string;
}
