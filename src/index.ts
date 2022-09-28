import Web3 from "web3";
import { EvmBridge } from "./chains/evm";
import { AllbridgeCoreClient } from "./client/core-api";
import { ApproveData, SendParams, TransactionResponse } from "./models";
import { TokensInfo } from "./tokens-info";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  private api: AllbridgeCoreClient;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.api = new AllbridgeCoreClient({ apiUrl: params.apiUrl });
  }

  async getTokensInfo(): Promise<TokensInfo> {
    return await this.api.getTokensInfo();
  }

  async evmApprove(
    web3: Web3,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    const evmBridge = new EvmBridge(web3);
    return evmBridge.approve(approveData);
  }

  async evmSend(web3: Web3, params: SendParams): Promise<TransactionResponse> {
    const evmBridge = new EvmBridge(web3);
    return evmBridge.send(params);
  }
}
