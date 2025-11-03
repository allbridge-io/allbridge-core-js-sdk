import { ClarigenClient, contractFactory } from "@clarigen/core";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError } from "../../../exceptions";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, TransactionResponse } from "../../models";
import { stacksContracts as contracts } from "../../models/stx/clarigen-types";
import { getStxNetwork } from "../../utils/stx/get-network";
import {
  ApproveParamsDto,
  ChainTokenService,
  CheckAllowanceParamsDto,
  GetAllowanceParamsDto,
  GetTokenBalanceParams,
} from "../models";

export class StxTokenService extends ChainTokenService {
  chainType: ChainType.STX = ChainType.STX;
  constructor(
    public nodeRpcUrl: string,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    const network = getStxNetwork(this.nodeRpcUrl);

    const client = new ClarigenClient(network);

    const token = contractFactory(contracts.ftToken, params.token.tokenAddress);

    const response = await client.roOk(token.getBalance({ owner: params.account }));
    return response.toString();
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    const url = `${this.nodeRpcUrl}/extended/v1/address/${params.account}/stx`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch account: ${res.status}`);
    }
    const data = (await res.json()) as { balance: string };
    const balance = data.balance;
    return BigInt(balance).toString();
  }

  getAllowance(_params: GetAllowanceParamsDto): Promise<string> {
    throw new MethodNotSupportedError();
  }

  checkAllowance(_params: CheckAllowanceParamsDto): Promise<boolean> {
    throw new MethodNotSupportedError();
  }

  approve(_params: ApproveParamsDto): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  buildRawTransactionApprove(_params: ApproveParamsDto): Promise<RawTransaction> {
    throw new MethodNotSupportedError();
  }
}
