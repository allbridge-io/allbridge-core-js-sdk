import { Big } from "big.js";
// @ts-expect-error import tron
import TronWeb from "tronweb";
import Web3 from "web3";
import { ChainDecimalsByType, chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { AllbridgeCoreSdkOptions } from "../../index";
import { AmountFormat, AmountFormatted } from "../../models";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { GetNativeTokenBalanceParams } from "../bridge/models";
import { NodeRpcUrlsConfig } from "../index";
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
import { SrbTokenService } from "./srb";
import { TronTokenService } from "./trx";

export interface TokenService {
  getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string>;

  checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean>;

  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction>;

  getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string>;

  getNativeTokenBalance(params: GetNativeTokenBalanceParams, provider?: Provider): Promise<AmountFormatted>;
}

export class DefaultTokenService implements TokenService {
  constructor(
    readonly api: AllbridgeCoreClient,
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  async getAllowance(params: GetAllowanceParams, provider?: Provider): Promise<string> {
    const allowanceInt = await this.getChainTokenService(params.token.chainSymbol, params.owner, provider).getAllowance(
      params
    );
    return convertIntAmountToFloat(allowanceInt, params.token.decimals).toFixed();
  }

  async checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    return this.getChainTokenService(params.token.chainSymbol, params.owner, provider).checkAllowance(
      this.prepareCheckAllowanceParams(params)
    );
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    if (approveData.amount) {
      validateAmountGtZero(approveData.amount);
      validateAmountDecimals("amount", approveData.amount, approveData.token.decimals);
    }
    return this.getChainTokenService(approveData.token.chainSymbol, approveData.owner, provider).approve(
      this.prepareApproveParams(approveData)
    );
  }

  async buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction> {
    if (approveData.amount) {
      validateAmountGtZero(approveData.amount);
      validateAmountDecimals("amount", approveData.amount, approveData.token.decimals);
    }
    return this.getChainTokenService(
      approveData.token.chainSymbol,
      approveData.owner,
      provider
    ).buildRawTransactionApprove(this.prepareApproveParams(approveData));
  }

  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    const tokenBalance = await this.getChainTokenService(
      params.token.chainSymbol,
      params.account,
      provider
    ).getTokenBalance(params);
    if (params.token.decimals) {
      return convertIntAmountToFloat(tokenBalance, params.token.decimals).toFixed();
    }
    return tokenBalance;
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams, provider?: Provider): Promise<AmountFormatted> {
    const tokenBalance = await this.getChainTokenService(
      params.chainSymbol,
      params.account,
      provider
    ).getNativeTokenBalance(params);
    return {
      [AmountFormat.INT]: tokenBalance,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(
        tokenBalance,
        ChainDecimalsByType[chainProperties[params.chainSymbol].chainType]
      ).toFixed(),
    };
  }

  private getChainTokenService(chainSymbol: ChainSymbol, ownerAddress: string, provider?: Provider): ChainTokenService {
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
          const tronWeb = new TronWeb({ fullHost: nodeRpcUrl });
          tronWeb.setAddress(ownerAddress);
          return new TronTokenService(tronWeb, this.api);
        }
      }
      case ChainType.SOLANA: {
        const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new SolanaTokenService(nodeRpcUrl, this.api);
      }
      case ChainType.SRB: {
        return new SrbTokenService(this.nodeRpcUrlsConfig, this.params, this.api);
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
