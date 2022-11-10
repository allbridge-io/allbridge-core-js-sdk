import Web3 from "web3";
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
      // Web3
      return new EvmBridge(provider as Web3);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }
}
