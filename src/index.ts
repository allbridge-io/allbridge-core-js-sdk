import axios from "axios";
import { Big, BigSource } from "big.js";
import Web3 from "web3";
import { EvmBridge } from "./chains/evm";
import { ChainDetailsMapDTO } from "./dto/api.model";
import { InsufficientPoolLiquidity } from "./exceptions";
import { ApproveData, SendParams, TransactionResponse } from "./models";
import {
  mapChainDetailsMapFromDTO,
  TokenInfo,
  TokensInfo,
} from "./tokens-info";
import {
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
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

  calculateFeesPercentOnSourceChain(
    amountFloat: BigSource,
    sourceChainToken: TokenInfo
  ): number {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    const vUsdInSystemPrecision = swapToVUsd(amountInt, sourceChainToken);
    const vUsdInSourcePrecision = fromSystemPrecision(
      vUsdInSystemPrecision,
      sourceChainToken.decimals
    );
    return getFeePercent(amountInt, vUsdInSourcePrecision).toNumber();
  }

  calculateFeesPercentOnDestinationChain(
    amountFloat: BigSource,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): number {
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
    return getFeePercent(vUsdInDestinationPrecision, usd).toNumber();
  }

  calculateAmountToBeReceived(
    amountToSendFloat: BigSource,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): string {
    const amountToSend = convertFloatAmountToInt(
      amountToSendFloat,
      sourceChainToken.decimals
    );

    const vUsd = swapToVUsd(amountToSend, sourceChainToken);
    const resultInt = swapFromVUsd(vUsd, destinationChainToken);
    if (resultInt.lte(0)) {
      throw new InsufficientPoolLiquidity();
    }
    return convertIntAmountToFloat(
      resultInt,
      sourceChainToken.decimals
    ).toFixed();
  }

  calculateAmountToSend(
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): string {
    const amountToBeReceived = convertFloatAmountToInt(
      amountToBeReceivedFloat,
      destinationChainToken.decimals
    );

    const usd = swapFromVUsdReverse(amountToBeReceived, destinationChainToken);
    const resultInt = swapToVUsdReverse(usd, sourceChainToken);
    if (resultInt.lte(0)) {
      throw new InsufficientPoolLiquidity();
    }
    return convertIntAmountToFloat(
      resultInt,
      sourceChainToken.decimals
    ).toFixed();
  }
}
