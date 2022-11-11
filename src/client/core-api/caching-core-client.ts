import { ChainSymbol } from "../../chains";
import { ChainDetailsMap } from "../../tokens-info";
import {
  ReceiveTransactionCostRequest,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClient } from "./index";

export class AllbridgeCachingCoreClient implements AllbridgeCoreClient {
  private readonly client;
  private chainDetailsMap: ChainDetailsMap | undefined;

  constructor(client: AllbridgeCoreClient) {
    this.client = client;
  }

  async getChainDetailsMap(): Promise<ChainDetailsMap> {
    if (this.chainDetailsMap === undefined) {
      this.chainDetailsMap = await this.client.getChainDetailsMap();
    }
    return this.chainDetailsMap;
  }

  getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    return this.client.getTransferStatus(chainSymbol, txId);
  }

  getReceiveTransactionCost(
    args: ReceiveTransactionCostRequest
  ): Promise<string> {
    return this.client.getReceiveTransactionCost(args);
  }
}
