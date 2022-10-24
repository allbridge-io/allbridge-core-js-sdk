/* eslint-disable @typescript-eslint/restrict-template-expressions */

import Web3 from "web3";
import { AllbridgeCoreClient } from "../client/core-api";
import { EvmBridge } from "./evm";
import {
  ApprovalBridge,
  ApproveData,
  Provider,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
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

  private getBridge(provider: Provider): ApprovalBridge {
    if (provider instanceof Web3) {
      return new EvmBridge(provider);
    } else {
      return new TronBridge(provider);
    }
  }
}
