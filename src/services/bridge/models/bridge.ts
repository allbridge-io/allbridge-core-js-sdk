import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { RawTransaction, TransactionResponse } from "../../models";
import { SendParams, SwapParams } from "./bridge.model";

export abstract class ChainBridgeService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  /**
   * @Deprecated Use {@link buildRawTransactionSend} or {@link buildRawTransactionSwap} instead<p>
   * Send tokens through the ChainBridgeService
   * @param params
   */
  abstract send(params: SendParams): Promise<TransactionResponse>;
  abstract buildRawTransactionSend(params: SendParams): Promise<RawTransaction>;
  abstract buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction>;
}
