import axios from "axios";
import { Big, BigSource } from "big.js";
import Web3 from "web3";
import { EvmBridge } from "./chains/evm";
import { ChainDetailsMapDTO } from "./dto/api.model";
import { ApproveData, SendParams, TransactionResponse } from "./models";
import {
  mapChainDetailsMapFromDTO,
  TokenInfo,
  TokensInfo,
} from "./tokens-info";
import {
  convertFloatAmountToInt,
  fromSystemPrecision,
  getSlippagePercent,
  swapFromVUsd,
  swapToVUsd,
} from "./utils/calculation";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  apiUrl: string;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.apiUrl = params.apiUrl;
  }

  async getTokensInfo(): Promise<TokensInfo> {
    const { data } = await axios.get<ChainDetailsMapDTO>(
      this.apiUrl + "/token-info",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return new TokensInfo(mapChainDetailsMapFromDTO(data));
  }

  async evmApprove(
    web3: Web3,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    const evmBridge = new EvmBridge(web3);
    return evmBridge.approve(approveData);
  }

  async evmSend(web3: Web3, params: SendParams): Promise<TransactionResponse> {
    const evmBridge = new EvmBridge(web3);
    return evmBridge.send(params);
  }

  calculateSlippagePercentOnSourceChain(
    amountFloat: BigSource,
    sourceChainToken: TokenInfo
  ): Big {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    const vUsdInSystemPrecision = swapToVUsd(amountInt, sourceChainToken);
    const vUsdInSourcePrecision = fromSystemPrecision(
      vUsdInSystemPrecision,
      sourceChainToken.decimals
    );
    return getSlippagePercent(amountInt, vUsdInSourcePrecision);
  }

  calculateSlippagePercentOnDestinationChain(
    amountFloat: BigSource,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): Big {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    const vUsdInSystemPrecision = swapToVUsd(amountInt, sourceChainToken);
    const usd = swapFromVUsd(vUsdInSystemPrecision, destinationChainToken);
    const vUsdInDestinationPrecision = fromSystemPrecision(
      vUsdInSystemPrecision,
      destinationChainToken.decimals
    );
    return getSlippagePercent(vUsdInDestinationPrecision, usd);
  }
}
