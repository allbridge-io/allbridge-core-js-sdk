import { Big } from "big.js";
import { Web3 } from "web3";
import { Chains } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions, ChainType, EssentialWeb3 } from "../../index";
import { AmountFormat, AmountFormatted } from "../../models";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { getTronWeb } from "../../utils/tronweb/lazy-load-tronweb-import";
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
  ChainTokenService,
} from "./models";
import { SolanaTokenService } from "./sol";
import { SrbTokenService } from "./srb";
import { SuiTokenService } from "./sui";
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
    const allowanceInt = await (
      await this.getChainTokenService(params.token.chainSymbol, params.owner, provider)
    ).getAllowance(params);
    return convertIntAmountToFloat(allowanceInt, params.token.decimals).toFixed();
  }

  async checkAllowance(params: CheckAllowanceParams, provider?: Provider): Promise<boolean> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    return (await this.getChainTokenService(params.token.chainSymbol, params.owner, provider)).checkAllowance(
      this.prepareCheckAllowanceParams(params)
    );
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    if (approveData.amount) {
      validateAmountGtZero(approveData.amount);
      validateAmountDecimals("amount", approveData.amount, approveData.token.decimals);
    }
    return (await this.getChainTokenService(approveData.token.chainSymbol, approveData.owner, provider)).approve(
      this.prepareApproveParams(approveData)
    );
  }

  async buildRawTransactionApprove(approveData: ApproveParams, provider?: Provider): Promise<RawTransaction> {
    if (approveData.amount) {
      validateAmountGtZero(approveData.amount);
      validateAmountDecimals("amount", approveData.amount, approveData.token.decimals);
    }
    return (
      await this.getChainTokenService(approveData.token.chainSymbol, approveData.owner, provider)
    ).buildRawTransactionApprove(this.prepareApproveParams(approveData));
  }

  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    const tokenBalance = await (
      await this.getChainTokenService(params.token.chainSymbol, params.account, provider)
    ).getTokenBalance(params);
    if (params.token.decimals) {
      return convertIntAmountToFloat(tokenBalance, params.token.decimals).toFixed();
    }
    return tokenBalance;
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams, provider?: Provider): Promise<AmountFormatted> {
    const tokenBalance = await (
      await this.getChainTokenService(params.chainSymbol, params.account, provider)
    ).getNativeTokenBalance(params);
    return {
      [AmountFormat.INT]: tokenBalance,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(
        tokenBalance,
        Chains.getChainDecimalsByType(Chains.getChainProperty(params.chainSymbol).chainType)
      ).toFixed(),
    };
  }

  private async getChainTokenService(
    chainSymbol: string,
    ownerAddress: string,
    provider?: Provider
  ): Promise<ChainTokenService> {
    switch (Chains.getChainProperty(chainSymbol).chainType) {
      case ChainType.EVM: {
        if (provider) {
          return new EvmTokenService(provider as EssentialWeb3, this.api);
        } else {
          const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
          return new EvmTokenService(new Web3(nodeRpcUrl), this.api);
        }
      }
      case ChainType.TRX: {
        if (provider) {
          /* eslint-disable-next-line  @typescript-eslint/no-unused-vars */
          const TronWeb = await getTronWeb();
          return new TronTokenService(provider as InstanceType<typeof TronWeb>, this.api);
        } else {
          const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
          const tronWeb = new (await getTronWeb())({ fullHost: nodeRpcUrl });
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
      case ChainType.SUI: {
        return new SuiTokenService(this.nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol), this.api);
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
