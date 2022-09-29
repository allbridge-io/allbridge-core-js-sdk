import { Big } from "big.js";
import { ChainSymbol } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";

export abstract class Bridge {
  abstract getTokenBalance(data: GetTokenBalanceData): Promise<string>;

  abstract send(params: SendParams): Promise<TransactionResponse>;
}

export abstract class ApprovalBridge extends Bridge {
  async isNeededApprove(approveData: ApproveData): Promise<boolean> {
    const allowance = await this.getAllowance(approveData);
    return Big(allowance).eq(0);
  }

  abstract approve(approveData: ApproveData): Promise<TransactionResponse>;

  abstract getAllowance(approveData: ApproveData): Promise<string>;
}

export interface ApproveData {
  tokenAddress: string;
  owner: string;
  spender: string;
}

export interface GetTokenBalanceData {
  tokenAddress: string;
  account: string;
}

export interface TransactionResponse {
  txId: string;
}

export interface SendParams {
  amount: string;
  fromChainSymbol: ChainSymbol;
  fromTokenAddress: string;
  fromAccountAddress: string;
  toChainSymbol: ChainSymbol;
  toTokenAddress: string;
  toAccountAddress: string;
  messenger: Messenger;
  fee?: string;
}
