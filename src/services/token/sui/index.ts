/* eslint-disable @typescript-eslint/no-unused-vars */
import { CoinStruct, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, TransactionResponse } from "../../models";
import { fetchAllPagesRecursive } from "../../utils/sui/paginated";
import { ApproveParamsDto, ChainTokenService, GetAllowanceParamsDto, GetTokenBalanceParams } from "../models";

export class SuiTokenService extends ChainTokenService {
  chainType: ChainType.SUI = ChainType.SUI;
  private suiClient: SuiJsonRpcClient;

  constructor(
    public suiRpcUrl: string,
    readonly params: AllbridgeCoreSdkOptions,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.suiClient = new SuiJsonRpcClient({
      url: this.suiRpcUrl,
      network: params.suiIsTestnet ? "testnet" : "mainnet",
    });
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
      const balance = await this.suiClient.getBalance({ owner: params.account, coinType: SUI_TYPE_ARG });
      return balance.totalBalance;
    }
    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const balance = await this.suiClient.getBalance({
      owner: params.account,
      coinType: params.token.originTokenAddress,
    });
    return balance.totalBalance;
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    const coinsData: CoinStruct[] = await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.suiClient.getCoins({
        owner: params.account,
        cursor,
      })
    );
    if (coinsData.length === 0) {
      return "0";
    }
    return coinsData.reduce((total, element) => total + BigInt(element.balance), BigInt(0)).toString();
  }
}
