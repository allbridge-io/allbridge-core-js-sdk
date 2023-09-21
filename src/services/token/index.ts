import { Big } from "big.js";
// @ts-expect-error import tron
import TronWeb from "tronweb";
import Web3 from "web3";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { NodeRpcUrlsConfig } from "../../index";
import { validateAmountDecimals } from "../../utils";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { Provider, RawTransaction, TransactionResponse } from "../models";
import { EvmTokenService } from "./evm";
import {
  ApproveParams,
  ApproveParamsDto,
  CheckAllowanceParams,
  CheckAllowanceParamsDto,
  GetAllowanceParams,
  GetTokenBalanceParams,
} from "./models";
import { ChainTokenService } from "./models/token";
import { SolanaTokenService } from "./sol";
import { TronTokenService } from "./trx";

export interface TokenService {
  getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string>;

  checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean>;

  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction>;

  getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string>;
}

export class DefaultTokenService implements TokenService {
  constructor(public api: AllbridgeCoreClient, public nodeRpcUrlsConfig: NodeRpcUrlsConfig) {}

  async getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string> {
    const allowanceInt = await this.getChainTokenService(params.token.chainSymbol, provider).getAllowance(params);
    return convertIntAmountToFloat(allowanceInt, params.token.decimals).toFixed();
  }

  async checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.token.decimals);
    return this.getChainTokenService(params.token.chainSymbol, provider).checkAllowance(
      this.prepareCheckAllowanceParams(params)
    );
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    if (approveData.amount) {
      validateAmountDecimals("amount", Big(approveData.amount).toString(), approveData.token.decimals);
    }
    return this.getChainTokenService(approveData.token.chainSymbol, provider).approve(
      this.prepareApproveParams(approveData)
    );
  }

  async buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction> {
    if (approveData.amount) {
      validateAmountDecimals("amount", Big(approveData.amount).toString(), approveData.token.decimals);
    }
    return this.getChainTokenService(approveData.token.chainSymbol, provider).buildRawTransactionApprove(
      this.prepareApproveParams(approveData)
    );
  }

  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    const tokenBalance = await this.getChainTokenService(params.token.chainSymbol, provider).getTokenBalance(params);
    if (params.token.decimals) {
      return convertIntAmountToFloat(tokenBalance, params.token.decimals).toFixed();
    }
    return tokenBalance;
  }

  private getChainTokenService(chainSymbol: ChainSymbol, provider?: Provider): ChainTokenService {
    switch (chainProperties[chainSymbol].chainType) {
      case ChainType.EVM: {
        if (provider) {
          return new EvmTokenService(provider as unknown as Web3, this.api);
        } else {
          const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
          return new EvmTokenService(new Web3(nodeRpcUrl), this.api);
        }
      }
      case ChainType.TRX: {
        if (provider) {
          return new TronTokenService(provider, this.api);
        } else {
          const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
          return new TronTokenService(new TronWeb({ fullHost: nodeRpcUrl }), this.api);
        }
      }
      case ChainType.SOLANA: {
        const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new SolanaTokenService(nodeRpcUrl, this.api);
      }
    }
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
