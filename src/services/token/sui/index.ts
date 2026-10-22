/* eslint-disable @typescript-eslint/no-unused-vars */
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, TransactionResponse } from "../../models";
import { createSuiClient } from "../../utils/sui/client";
import { ApproveParamsDto, ChainTokenService, GetAllowanceParamsDto, GetTokenBalanceParams } from "../models";

export class SuiTokenService extends ChainTokenService {
  chainType: ChainType.SUI = ChainType.SUI;
  private suiClient: SuiGrpcClient;

  constructor(
    public suiRpcUrl: string,
    readonly params: AllbridgeCoreSdkOptions,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.suiClient = createSuiClient(this.suiRpcUrl, params.suiIsTestnet);
  }

  approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
    throw new MethodNotSupportedError();
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    throw new MethodNotSupportedError();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    if (params.token.isNative) {
      const { balance } = await this.suiClient.core.getBalance({ owner: params.account, coinType: SUI_TYPE_ARG });
      return balance.balance;
    }
    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const { balance } = await this.suiClient.core.getBalance({
      owner: params.account,
      coinType: params.token.originTokenAddress,
    });
    return balance.balance;
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    const { balance } = await this.suiClient.core.getBalance({ owner: params.account, coinType: SUI_TYPE_ARG });
    return balance.balance;
  }
}
