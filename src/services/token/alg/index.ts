import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError } from "../../../exceptions";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, TransactionResponse } from "../../models";
import { ApproveParamsDto, ChainTokenService, GetAllowanceParamsDto, GetTokenBalanceParams } from "../models";

export class AlgTokenService extends ChainTokenService {
  chainType: ChainType.SUI = ChainType.SUI;

  constructor(
    public algorand: AlgorandClient,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  approve(_params: ApproveParamsDto): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  buildRawTransactionApprove(_params: ApproveParamsDto): Promise<RawTransaction> {
    throw new MethodNotSupportedError();
  }

  getAllowance(_params: GetAllowanceParamsDto): Promise<string> {
    throw new MethodNotSupportedError();
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    const { account } = params;
    const info = await this.algorand.account.getInformation(account);
    return info.balance.microAlgo.toString();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    const { account, token } = params;
    try {
      const info = await this.algorand.asset.getAccountInformation(account, BigInt(token.tokenAddress));
      return info.balance.toString();
    } catch (e) {
      if (e instanceof Error) {
        e.message.includes("account asset info not found");
        return "0";
      }
      throw e;
    }
  }
}
