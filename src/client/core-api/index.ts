import axios, { Axios } from "axios";
import { TokensInfo } from "../../tokens-info";
import { mapChainDetailsMapFromDTO } from "./core-api-mapper";
import {
  ChainDetailsMapDTO,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "./core-api.model";

export interface AllbridgeCoreClientParams {
  apiUrl: string;
}

export class AllbridgeCoreClient {
  private api: Axios;

  constructor(params: AllbridgeCoreClientParams) {
    this.api = axios.create({
      baseURL: params.apiUrl,
    });
  }

  async getTokensInfo(): Promise<TokensInfo> {
    const { data } = await this.api.get<ChainDetailsMapDTO>("/token-info", {
      headers: {
        Accept: "application/json",
      },
    });
    return new TokensInfo(mapChainDetailsMapFromDTO(data));
  }

  async getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string> {
    const { data } = await this.api.post<ReceiveTransactionCostResponse>(
      "/receive-fee",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: args,
      }
    );
    return data.fee;
  }
}
