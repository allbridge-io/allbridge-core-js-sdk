/* eslint-disable @typescript-eslint/restrict-template-expressions */

import Web3 from "web3";
import { chainProperties, ChainType } from "../chains";
import { AllbridgeCoreClient } from "../client/core-api";
import { EvmBridge } from "./evm";
import {
  ApproveData,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./models";

export class BridgeService {
  constructor(public api: AllbridgeCoreClient) {}

  async evmApprove(
    web3: Web3,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    const evmBridge = new EvmBridge(this.api, web3);
    return evmBridge.approve(approveData);
  }

  async send(
    web3: Web3,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    let chainType;
    if (BridgeService.isSendParamsWithChainSymbol(params)) {
      chainType = chainProperties[params.fromChainSymbol].chainType;
    } else {
      chainType =
        chainProperties[params.sourceChainToken.chainSymbol].chainType;
    }
    switch (chainType) {
      case ChainType.EVM: {
        const evmBridge = new EvmBridge(this.api, web3);
        return evmBridge.send(params);
      }
      case ChainType.SOLANA: {
        throw new Error(
          `Error in send method: method not implemented for SOLANA`
        );
      }
      case ChainType.TRX: {
        throw new Error(`Error in send method: method not implemented for TRX`);
      }
      default: {
        throw new Error(
          `Error in send method: unknown chain type ${chainType}, or method not implemented`
        );
      }
    }
  }

  static isSendParamsWithChainSymbol(
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): params is SendParamsWithChainSymbols {
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    return (params as SendParamsWithChainSymbols).fromChainSymbol !== undefined;
  }
}
