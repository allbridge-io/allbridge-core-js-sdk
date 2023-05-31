import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { Provider, RawTransaction, TransactionResponse } from "../models";
import { EvmTokenService } from "./evm";
import {
  ApproveParams,
  ApproveParamsDto,
  CheckAllowanceParamsDto,
  CheckAllowanceParams,
  GetAllowanceParams,
  GetTokenBalanceParams,
} from "./models";
import { ChainTokenService } from "./models/token";
import { SolanaTokenParams, SolanaTokenService } from "./sol";
import { TronTokenService } from "./trx";

export class TokenService {
  constructor(public api: AllbridgeCoreClient, public solParams: SolanaTokenParams) {}

  /**
   * Get amount of tokens approved for pool
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  async getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string> {
    const allowanceInt = await this.getChainTokenService(provider).getAllowance(params);
    return convertIntAmountToFloat(allowanceInt, params.token.decimals).toFixed();
  }

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  async checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean> {
    return this.getChainTokenService(provider).checkAllowance(this.prepareCheckAllowanceParams(params));
  }

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.getChainTokenService(provider).approve(this.prepareApproveParams(approveData));
  }

  async buildRawTransactionApprove(provider: Provider, approveData: ApproveParams): Promise<RawTransaction> {
    return this.getChainTokenService(provider).buildRawTransactionApprove(this.prepareApproveParams(approveData));
  }

  /**
   * Get token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    const tokenBalance = await this.getChainTokenService(provider).getTokenBalance(params);
    if (params.token.decimals) {
      return convertIntAmountToFloat(tokenBalance, params.token.decimals).toString();
    }
    return tokenBalance;
  }

  private getChainTokenService(provider?: Provider): ChainTokenService {
    if (!provider) {
      return new SolanaTokenService(this.solParams, this.api);
    }
    if (this.isTronWeb(provider)) {
      return new TronTokenService(provider, this.api);
    } else {
      // Web3
      return new EvmTokenService(provider as unknown as Web3, this.api);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }

  prepareCheckAllowanceParams(params: CheckAllowanceParams): CheckAllowanceParamsDto {
    return {
      ...params,
      amount: convertFloatAmountToInt(params.amount, params.token.decimals),
    };
  }

  private prepareApproveParams(approveData: ApproveParams): ApproveParamsDto {
    return {
      tokenAddress: approveData.token.tokenAddress,
      owner: approveData.owner,
      spender: approveData.spender,
      chainSymbol: approveData.token.chainSymbol,
      amount: approveData.amount == undefined ? undefined : Big(approveData.amount).toFixed(),
    };
  }
}
