import { TronWeb } from "tronweb-typings";
import { AllbridgeCoreClient } from "../client/core-api";
import { EvmBridge } from "./evm";
import {
  Bridge,
  ApproveData,
  Provider,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
  RawTransaction,
} from "./models";
import { TronBridge } from "./trx";
import { prepareTxSendParams } from "./utils";

export class BridgeService {
  constructor(public api: AllbridgeCoreClient) {}

  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return this.getBridge(provider).approve(approveData);
  }

  async buildRawTransactionApprove(
    provider: Provider,
    approveData: ApproveData
  ): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionApprove(approveData);
  }

  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    const bridge = this.getBridge(provider);
    const txSendParams = await prepareTxSendParams(
      bridge.chainType,
      params,
      this.api
    );
    return bridge.sendTx(txSendParams);
  }

  async buildRawTransactionSend(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<RawTransaction> {
    const bridge = this.getBridge(provider);
    const txSendParams = await prepareTxSendParams(
      bridge.chainType,
      params,
      this.api
    );
    return bridge.buildRawTransactionSend(txSendParams);
  }

  private getBridge(provider: Provider): Bridge {
    if (this.isTronWeb(provider)) {
      return new TronBridge(provider);
    } else {
      return new EvmBridge(provider);
    }
  }

  private isTronWeb(params: Provider): params is TronWeb {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }
}
