import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { Provider, RawTransaction } from "../models";
import { EvmBridge } from "./evm";
import {
  ApproveDataWithTokenInfo,
  ApproveParamsDto,
  Bridge,
  CheckAllowanceParamsDto,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./models";
import { SolanaBridge, SolanaBridgeParams } from "./sol";
import { TronBridge } from "./trx";

export class BridgeService {
  constructor(public api: AllbridgeCoreClient, public solParams: SolanaBridgeParams) {}

  async getAllowance(provider: Provider, params: GetAllowanceParamsWithTokenInfo): Promise<string> {
    const allowanceInt = await this.getBridge(provider).getAllowance(params);
    return convertIntAmountToFloat(allowanceInt, params.tokenInfo.decimals).toFixed();
  }

  async checkAllowance(provider: Provider, params: CheckAllowanceParamsWithTokenInfo): Promise<boolean> {
    return this.getBridge(provider).checkAllowance(this.prepareCheckAllowanceParams(params));
  }

  async approve(provider: Provider, approveData: ApproveDataWithTokenInfo): Promise<TransactionResponse> {
    return this.getBridge(provider).approve(this.prepareApproveParams(approveData));
  }

  async buildRawTransactionApprove(provider: Provider, approveData: ApproveDataWithTokenInfo): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionApprove(this.prepareApproveParams(approveData));
  }

  async send(provider: Provider, params: SendParamsWithTokenInfos): Promise<TransactionResponse> {
    return this.getBridge(provider).send(params);
  }

  async buildRawTransactionSend(params: SendParamsWithTokenInfos, provider?: Provider): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionSend(params);
  }

  async getTokenBalance(params: GetTokenBalanceParamsWithTokenInfo, provider?: Provider): Promise<string> {
    const tokenBalance = await this.getBridge(provider).getTokenBalance(params);
    if (params.tokenInfo.decimals) {
      return convertIntAmountToFloat(tokenBalance, params.tokenInfo.decimals).toString();
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
      return new EvmBridge(provider as unknown as Web3, this.api);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }

  prepareCheckAllowanceParams(params: CheckAllowanceParamsWithTokenInfo): CheckAllowanceParamsDto {
    return {
      ...params,
      amount: convertFloatAmountToInt(params.amount, params.tokenInfo.decimals),
    };
  }

  private prepareApproveParams(approveData: ApproveDataWithTokenInfo): ApproveParamsDto {
    return {
      tokenAddress: approveData.token.tokenAddress,
      owner: approveData.owner,
      spender: approveData.spender,
      chainSymbol: approveData.token.chainSymbol,
      amount: approveData.amount == undefined ? undefined : Big(approveData.amount).toFixed(),
    };
  }
}
