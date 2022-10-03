import { Big } from "big.js";
import { ChainSymbol, ChainType } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";
import { TokenInfoWithChainDetails } from "../../tokens-info";

export abstract class Bridge {
  abstract getTokenBalance(data: GetTokenBalanceData): Promise<string>;

  abstract send(params: BaseSendParams): Promise<TransactionResponse>;
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

export interface BaseSendParams {
  amount: string;
  fromAccountAddress: string;
  toAccountAddress: string;
  messenger: Messenger;
  fee?: string;
}

export interface ChainSymbolsSendParams extends BaseSendParams {
  fromChainSymbol: ChainSymbol;
  fromTokenAddress: string;
  toChainSymbol: ChainSymbol;
  toTokenAddress: string;
}

export interface TokensInfoSendParams extends BaseSendParams {
  sourceChainToken: TokenInfoWithChainDetails;
  destinationChainToken: TokenInfoWithChainDetails;
}

export interface TxSendParams {
  amount: string;
  contractAddress: string;
  fromAccountAddress: string;
  fromTokenAddress: string;
  toChainType: ChainType;
  toChainId: number;
  toAccountAddress: string;
  toTokenAddress: string;
  messenger: Messenger;
  fee: string;
}
