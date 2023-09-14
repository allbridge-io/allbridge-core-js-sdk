import { Big } from "big.js";
import { ChainSymbolType } from "../../../chains";
import { FeePaymentMethod } from "../../../models";
import { TokenWithChainDetails } from "../../../tokens-info";

export interface ApproveParams {
  /**
   * The token info
   */
  token: TokenWithChainDetails;

  /**
   *  The address of the token owner who is granting permission to use tokens
   *  to the spender
   */
  owner: string;

  /**
   *  The address of the contract that is being granted permission to use tokens
   */
  spender: string;

  /**
   * The integer amount of tokens to approve.
   * Optional.
   * The maximum amount by default.
   */
  amount?: string | number | Big;
}

export interface GetTokenBalanceParams {
  /**
   *  The address for which we will find out the token balance
   */
  account: string;
  token: TokenWithChainDetails;
}

export interface CheckAllowanceParams extends GetAllowanceParams {
  /**
   * The float amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}

export interface GetAllowanceParams {
  token: TokenWithChainDetails;
  spender: string;
  owner: string;
  gasFeePaymentMethod?: FeePaymentMethod;
}

export interface ApproveParamsDto {
  tokenAddress: string;
  chainSymbol: ChainSymbolType;
  owner: string;
  spender: string;
  /**
   * Integer amount of tokens to approve.
   */
  amount?: string;
}

export type GetAllowanceParamsDto = GetAllowanceParams;

/**
 * @internal
 */
export interface CheckAllowanceParamsDto extends GetAllowanceParamsDto {
  /**
   * The integer amount of tokens to check the allowance.
   */
  amount: string | number | Big;
}
