import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { RawSuiTransaction, SendParams } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { SuiBridgeService } from "../../services/bridge/sui";

/**
 * Contains useful Sui methods
 */
export interface SuiUtils {
  buildSendTxFromCustomTx(
    baseTx: string | Uint8Array | Transaction,
    inputCoin: TransactionResult,
    params: SendParams
  ): Promise<RawSuiTransaction>;
}

export class DefaultSuiUtils implements SuiUtils {
  private _suiBridgeService: SuiBridgeService | undefined;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly api: AllbridgeCoreClient
  ) {}

  async buildSendTxFromCustomTx(
    baseTx: string | Uint8Array | Transaction,
    inputCoin: TransactionResult,
    params: SendParams
  ): Promise<RawSuiTransaction> {
    return this.suiBridgeService.buildRawTransactionSendFromCustomTx(baseTx, inputCoin, params);
  }

  private get suiBridgeService() {
    if (!this._suiBridgeService) {
      this._suiBridgeService = new SuiBridgeService(this.nodeRpcUrlsConfig, this.api);
    }
    return this._suiBridgeService;
  }
}
