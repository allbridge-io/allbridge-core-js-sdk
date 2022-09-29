import { Big, BigSource } from "big.js";
import Web3 from "web3";
import { EvmBridge } from "./chains/evm";
import { AllbridgeCoreClient } from "./client/core-api";
import {
  AmountsAndTxCost,
  ApproveData,
  Messenger,
  SendParams,
  TransactionResponse,
} from "./models";
import {
  TokenInfo,
  TokenInfoWithChainDetails,
  TokensInfo,
} from "./tokens-info";
import {
  convertFloatAmountToInt, convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd, swapFromVUsdReverse,
  swapToVUsd, swapToVUsdReverse,
} from "./utils/calculation";
import {InsufficientPoolLiquidity} from "./exceptions";

export * from "./models";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  private api: AllbridgeCoreClient;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.api = new AllbridgeCoreClient({ apiUrl: params.apiUrl });
  }

  async getTokensInfo(): Promise<TokensInfo> {
    return await this.api.getTokensInfo();
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
    return getFeePercent(amountInt, vUsdInSourcePrecision);
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
    return getFeePercent(vUsdInDestinationPrecision, usd);
  }

  async getAmountToBeReceivedAndTxCost(
    amountToSendFloat: BigSource,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndTxCost> {
    return {
      fromAmount: Big(amountToSendFloat).toFixed(),
      toAmount: this.getAmountToBeReceived(
        amountToSendFloat,
        sourceChainToken,
        destinationChainToken
      ),
      txCost: await this.getTxCost(sourceChainToken, destinationChainToken, messenger),
    };
  }

  async getAmountToSendAndTxCost(
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndTxCost> {
    return {
      fromAmount: this.getAmountToSend(
        amountToBeReceivedFloat,
        sourceChainToken,
        destinationChainToken
      ),
      toAmount: Big(amountToBeReceivedFloat).toFixed(),
      txCost: await this.getTxCost(sourceChainToken, destinationChainToken, messenger),
    };
  }

  getAmountToBeReceived(
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

  getAmountToSend(
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

  async getTxCost(sourceChainToken: TokenInfoWithChainDetails, destinationChainToken: TokenInfoWithChainDetails, messenger: Messenger) {
    return await this.api.getReceiveTransactionCost({
      sourceChainId: sourceChainToken.allbridgeChainId,
      destinationChainId: destinationChainToken.allbridgeChainId,
      messenger,
    });
  }

}
