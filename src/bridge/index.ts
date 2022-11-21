import { Big } from "big.js";
import Web3 from "web3";
import { AllbridgeCoreClient } from "../client/core-api";
import {
  convertFloatAmountToInt,
  convertIntAmountToFloat,
} from "../utils/calculation";
import { EvmBridge } from "./evm";
import {
  ApproveData,
  ApproveParamsDto,
  Bridge,
  CheckAllowanceParamsDto,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsDto,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  Provider,
  RawTransaction,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./models";
import { SolanaBridge, SolanaBridgeParams } from "./sol";
import { TronBridge } from "./trx";
import {
  getTokenInfoByTokenAddress,
  isGetAllowanceParamsWithTokenInfo,
} from "./utils";

export class BridgeService {
  constructor(
    public api: AllbridgeCoreClient,
    public solParams: SolanaBridgeParams
  ) {}

  async getAllowance(
    provider: Provider,
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<string> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    const allowanceInt = await this.getBridge(provider).getAllowance(
      getAllowanceParams
    );
    return convertIntAmountToFloat(
      allowanceInt,
      getAllowanceParams.tokenInfo.decimals
    ).toFixed();
  }

  async checkAllowance(
    provider: Provider,
    params:
      | CheckAllowanceParamsWithTokenAddress
      | CheckAllowanceParamsWithTokenInfo
  ): Promise<boolean> {
    return this.getBridge(provider).checkAllowance(
      await this.prepareCheckAllowanceParams(params)
    );
  }

  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return this.getBridge(provider).approve(
      this.prepareApproveParams(approveData)
    );
  }

  async buildRawTransactionApprove(
    provider: Provider,
    approveData: ApproveData
  ): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionApprove(
      this.prepareApproveParams(approveData)
    );
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
    params:
      | CheckAllowanceParamsWithTokenAddress
      | CheckAllowanceParamsWithTokenInfo
  ): Promise<CheckAllowanceParamsDto> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    return {
      ...getAllowanceParams,
      amount: convertFloatAmountToInt(
        params.amount,
        getAllowanceParams.tokenInfo.decimals
      ),
    };
  }

  private prepareApproveParams(approveData: ApproveData): ApproveParamsDto {
    return {
      tokenAddress: approveData.tokenAddress,
      owner: approveData.owner,
      spender: approveData.spender,
      amount:
        approveData.amount == undefined
          ? undefined
          : Big(approveData.amount).toFixed(),
    };
  }
}
