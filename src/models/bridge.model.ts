import { Big } from "big.js";

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
  account: string;
  contractAddress: string;
  tokenAddress: string;
  amount: string;
  receiverAddress: string;
  destinationChainId: number;
  receiveTokenAddress: string;
  messenger: number;
  fee: string;
}
