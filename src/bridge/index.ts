/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { AllbridgeCoreClient } from "../client/core-api";
import {
  ApproveData,
  Provider,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./models";
import { prepareTxSendParams } from "./utils";

export class BridgeService {
  constructor(public api: AllbridgeCoreClient) {}

  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return provider.getBridge(this.api).approve(approveData);
  }

  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    const txSendParams = await prepareTxSendParams(
      provider.chainType,
      params,
      this.api
    );
    return provider.getBridge(this.api).sendTx(txSendParams);
  }

  static isSendParamsWithChainSymbol(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): params is SendParamsWithChainSymbols {
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    return (params as SendParamsWithChainSymbols).fromChainSymbol !== undefined;
  }
}
