/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { TronWeb } from "tronweb-typings";
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
