import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { RawTransaction, TransactionResponse } from "../../models";
import { SendParams, SwapParams, TxTransferParams } from "./bridge.model";

export abstract class ChainBridgeService {
  abstract chainType: ChainType;
  abstract api: AllbridgeCoreClient;

  /**
   * @deprecated Use {@link buildRawTransactionSend} or {@link buildRawTransactionSwap} instead<p>
   * Send tokens through the ChainBridgeService
   * @param params
   */
  abstract send(params: SendParams): Promise<TransactionResponse>;
  abstract buildRawTransactionSend(params: SendParams): Promise<RawTransaction>;
  /** @deprecated Do not use. */
  abstract buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction>;
  /**
   * Builds a plain transfer of `params.amount` of `params.token` to `params.toAddress`
   * (a value transfer when `params.token.isNative`). Used for `Messenger.NEAR_INTENTS` deposits.
   */
  abstract buildRawTransactionTransfer(params: TxTransferParams): Promise<RawTransaction>;
}
