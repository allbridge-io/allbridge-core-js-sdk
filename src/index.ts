import axios from "axios";
import Web3 from "web3";
import { EvmBridge } from "./chains/evm";
import { ChainDetailsMapDTO } from "./dto/api.model";
import { ApproveData, SendParams, TransactionResponse } from "./models";
import { TokensInfo, mapChainDetailsMapFromDTO } from "./tokens-info";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  apiUrl: string;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.apiUrl = params.apiUrl;
  }

  async getTokensInfo(): Promise<TokensInfo> {
    const { data } = await axios.get<ChainDetailsMapDTO>(
      this.apiUrl + "/token-info",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return new TokensInfo(mapChainDetailsMapFromDTO(data));
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
