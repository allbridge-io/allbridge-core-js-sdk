import axios, { Axios } from "axios";
import { ChainSymbol } from "../../chains";
import { ChainDetailsMap } from "../../tokens-info";
import { mapChainDetailsMapFromDTO } from "./core-api-mapper";
import {
  ChainDetailsMapDTO,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";

export interface AllbridgeCoreClientParams {
  apiUrl: string;
}

export interface AllbridgeCoreClient {
  readonly params: AllbridgeCoreClientParams;

  getChainDetailsMap(): Promise<ChainDetailsMap>;

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse>;

  getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string>;
}

export class AllbridgeCoreClientImpl implements AllbridgeCoreClient {
  private api: Axios;
  readonly params: AllbridgeCoreClientParams;

  constructor(params: AllbridgeCoreClientParams) {
    this.params = params;
    this.api = axios.create({
      baseURL: params.apiUrl,
      headers: {
        Accept: "application/json",
      },
    });
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    const { data } = await this.api.get<ChainDetailsMapDTO>("/token-info");
    return mapChainDetailsMapFromDTO(data);
  }

  async getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    const { data } = await this.api.get<TransferStatusResponse>(
      `/chain/${chainSymbol}/${txId}`
    );
    return data;
  }

  async getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string> {
    const { data } = await this.api.post<ReceiveTransactionCostResponse>(
      "/receive-fee",
      args,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.fee;
  }
}
