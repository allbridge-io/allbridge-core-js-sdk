import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction, TransactionResponse } from "../../models";
import { prepareTxSendParams } from "../utils";
import { SendParams, SwapParams, TxSendParams } from "./bridge.model";

export abstract class ChainBridgeService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  /**
   * @Deprecated Use {@link buildRawTransactionSend} or {@link buildRawTransactionSwap} instead<p>
   * Send tokens through the ChainBridgeService
   * @param params
   */
  async send(params: SendParams): Promise<TransactionResponse> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    return this.sendTx(txSendParams);
  }

  /**
   * @Deprecated Use {@link buildRawTransactionSend} or {@link buildRawTransactionSwap} instead<p>
   * Send tokens through the ChainBridgeService
   * @param params
   */
  abstract sendTx(params: TxSendParams): Promise<TransactionResponse>;

  abstract buildRawTransactionSend(params: SendParams): Promise<RawTransaction>;
  abstract buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction>;
}
