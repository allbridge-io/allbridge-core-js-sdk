import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { Provider, RawTransaction } from "../models";
import { EvmBridge } from "./evm";
import {
  ApproveData,
  ApproveDataWithTokenInfo,
  ApproveParamsDto,
  Bridge,
  CheckAllowanceParamsDto,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsDto,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenAddress,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./models";
import { SolanaBridge, SolanaBridgeParams } from "./sol";
import { TronBridge } from "./trx";
import {
  getTokenInfoByTokenAddress,
  isApproveDataWithTokenInfo,
  isGetAllowanceParamsWithTokenInfo,
  isGetTokenBalanceParamsWithTokenInfo,
} from "./utils";

export class BridgeService {
  constructor(public api: AllbridgeCoreClient, public solParams: SolanaBridgeParams) {}

  async getAllowance(
    provider: Provider,
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<string> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    const allowanceInt = await this.getBridge(provider).getAllowance(getAllowanceParams);
    return convertIntAmountToFloat(allowanceInt, getAllowanceParams.tokenInfo.decimals).toFixed();
  }

  async checkAllowance(
    provider: Provider,
    params: CheckAllowanceParamsWithTokenAddress | CheckAllowanceParamsWithTokenInfo
  ): Promise<boolean> {
    return this.getBridge(provider).checkAllowance(await this.prepareCheckAllowanceParams(params));
  }

  async approve(provider: Provider, approveData: ApproveData | ApproveDataWithTokenInfo): Promise<TransactionResponse> {
    return this.getBridge(provider).approve(await this.prepareApproveParams(approveData));
  }

  async buildRawTransactionApprove(
    provider: Provider,
    approveData: ApproveData | ApproveDataWithTokenInfo
  ): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionApprove(await this.prepareApproveParams(approveData));
  }

  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    return this.getBridge(provider).send(params);
  }

  async buildRawTransactionSend(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos,
    provider?: Provider
  ): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionSend(params);
  }

  async getTokenBalance(
    params: GetTokenBalanceParamsWithTokenAddress | GetTokenBalanceParamsWithTokenInfo,
    provider?: Provider
  ): Promise<string> {
    let tokenBalanceParams: GetTokenBalanceParamsWithTokenAddress;

    if (isGetTokenBalanceParamsWithTokenInfo(params)) {
      tokenBalanceParams = {
        account: params.account,
        tokenAddress: params.tokenInfo.tokenAddress,
        tokenDecimals: params.tokenInfo.decimals,
      };
    } else {
      tokenBalanceParams = params;
    }

    const tokenBalance = await this.getBridge(provider).getTokenBalance(tokenBalanceParams);
    if (tokenBalanceParams.tokenDecimals) {
      return convertIntAmountToFloat(tokenBalance, tokenBalanceParams.tokenDecimals).toString();
    }
    return tokenBalance;
  }

  private getBridge(provider?: Provider): Bridge {
    if (!provider) {
      return new SolanaBridge(this.solParams, this.api);
    }
    if (this.isTronWeb(provider)) {
      return new TronBridge(provider, this.api);
    } else {
      // Web3
      return new EvmBridge(provider as Web3, this.api);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }

  async prepareGetAllowanceParams(
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<GetAllowanceParamsDto> {
    if (isGetAllowanceParamsWithTokenInfo(params)) {
      return params as GetAllowanceParamsDto;
    } else {
      const tokenInfo = getTokenInfoByTokenAddress(
        await this.api.getChainDetailsMap(),
        (params as GetAllowanceParamsWithTokenAddress).chainSymbol,
        (params as GetAllowanceParamsWithTokenAddress).tokenAddress
      );
      return {
        tokenInfo,
        owner: params.owner,
      };
    }
  }

  async prepareCheckAllowanceParams(
    params: CheckAllowanceParamsWithTokenAddress | CheckAllowanceParamsWithTokenInfo
  ): Promise<CheckAllowanceParamsDto> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    return {
      ...getAllowanceParams,
      amount: convertFloatAmountToInt(params.amount, getAllowanceParams.tokenInfo.decimals),
    };
  }

  private async prepareApproveParams(approveData: ApproveData | ApproveDataWithTokenInfo): Promise<ApproveParamsDto> {
    if (isApproveDataWithTokenInfo(approveData)) {
      approveData = approveData as ApproveDataWithTokenInfo;
      return {
        tokenAddress: approveData.token.tokenAddress,
        owner: approveData.owner,
        spender: approveData.spender,
        chainSymbol: approveData.token.chainSymbol,
        amount: approveData.amount == undefined ? undefined : Big(approveData.amount).toFixed(),
      };
    } else {
      approveData = approveData as ApproveData;
      const chainSymbol = (await this.api.tokens()).find(
        (tokenInfo) => tokenInfo.tokenAddress === (approveData as ApproveData).tokenAddress
      )?.chainSymbol;
      if (!chainSymbol) {
        throw Error(`Unknown chain by token address ${approveData.tokenAddress}`);
      }
      return {
        tokenAddress: approveData.tokenAddress,
        owner: approveData.owner,
        spender: approveData.spender,
        chainSymbol: chainSymbol,
        amount: approveData.amount == undefined ? undefined : Big(approveData.amount).toFixed(),
      };
    }
  }
}
