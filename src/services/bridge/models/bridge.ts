import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction, TransactionResponse } from "../../models";
import { prepareTxSendParams } from "../utils";
import { SendParams, TxSendParams } from "./bridge.model";

export abstract class ChainBridgeService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  async send(params: SendParams): Promise<TransactionResponse> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    return this.sendTx(txSendParams);
  }

  abstract sendTx(params: TxSendParams): Promise<TransactionResponse>;

  abstract buildRawTransactionSend(params: SendParams): Promise<RawTransaction>;
}
