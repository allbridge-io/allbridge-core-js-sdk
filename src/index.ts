import { Big } from "big.js";
import { BridgeService } from "./bridge";
import {
  ApproveData,
  Provider,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./bridge/models";
import { AllbridgeCoreClient } from "./client/core-api";
import { production } from "./configs";
import { InsufficientPoolLiquidity } from "./exceptions";
import { AmountsAndTxCost, Messenger } from "./models";
import {
  TokenInfo,
  TokenInfoWithChainDetails,
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

export * from "./configs/production";
export * from "./models";
export {
  TokenInfo,
  TokensInfo,
  ChainDetailsMap,
  ChainDetailsWithTokens,
} from "./tokens-info";

export interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  /**
   * @internal
   */
  private readonly api: AllbridgeCoreClient;
  /**
   * @internal
   */
  private bridgeService: BridgeService;

  /**
   * Initializes the SDK object.
   * @param params Preset parameters can be used. See {@link production | production preset}
   */
  constructor(params: AllbridgeCoreSdkOptions = production) {
    this.api = new AllbridgeCoreClient({ apiUrl: params.apiUrl });
    this.bridgeService = new BridgeService(this.api);
  }

  /**
   * Fetches information about the supported tokens from the Allbridge Core API.
   */
  async getTokensInfo(): Promise<TokensInfo> {
    return this.api.getTokensInfo();
  }

  /**
   * Approve tokens usage by another address on chains
   * @param provider
   * @param approveData
   */
  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return await this.bridgeService.approve(provider, approveData);
  }

  /**
   * Send tokens through the Bridge
   * @param provider
   * @param params
   */
  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    return this.bridgeService.send(provider, params);
  }

  /**
   * Calculates the percentage of fee from the initial amount that is charged when swapping from the selected source chain.
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @returns fee percent
   */
  calculateFeePercentOnSourceChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenInfo
  ): number {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(amountInt, sourceChainToken);
    const vUsdInSourcePrecision = fromSystemPrecision(
      vUsdInSystemPrecision,
      sourceChainToken.decimals
    );
    return getFeePercent(amountInt, vUsdInSourcePrecision);
  }

  /**
   * Calculates the percentage of fee that is charged when swapping to the selected destination chain. The destination chain fee percent applies to the amount after the source chain fee.
   * @see {@link calculateFeePercentOnSourceChain}
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @returns fee percent
   */
  calculateFeePercentOnDestinationChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): number {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(amountInt, sourceChainToken);
    const usd = swapFromVUsd(vUsdInSystemPrecision, destinationChainToken);
    const vUsdInDestinationPrecision = fromSystemPrecision(
      vUsdInSystemPrecision,
      destinationChainToken.decimals
    );
    return getFeePercent(vUsdInDestinationPrecision, usd);
  }

  /**
   * Calculates the amount of tokens the receiving party will get as a result of the swap
   * and fetches the amount of units in source chain currency to pay for the swap.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   */
  async getAmountToBeReceivedAndTxCost(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndTxCost> {
    return {
      amountToSendFloat: Big(amountToSendFloat).toFixed(),
      amountToBeReceivedFloat: this.getAmountToBeReceived(
        amountToSendFloat,
        sourceChainToken,
        destinationChainToken
      ),
      txCost: await this.getTxCost(
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
    };
  }

  /**
   * Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a result of the swap
   * and fetches the amount of units in source chain currency to pay for the swap.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   */
  async getAmountToSendAndTxCost(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndTxCost> {
    return {
      amountToSendFloat: this.getAmountToSend(
        amountToBeReceivedFloat,
        sourceChainToken,
        destinationChainToken
      ),
      amountToBeReceivedFloat: Big(amountToBeReceivedFloat).toFixed(),
      txCost: await this.getTxCost(
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
    };
  }

  /**
   * Calculates the amount of tokens the receiving party will get as a result of the swap.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   */
  getAmountToBeReceived(
    amountToSendFloat: number | string | Big,
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
      destinationChainToken.decimals
    ).toFixed();
  }

  /**
   * Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a result of the swap.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   */
  getAmountToSend(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenInfo,
    destinationChainToken: TokenInfo
  ): string {
    const amountToBeReceived = convertFloatAmountToInt(
      amountToBeReceivedFloat,
      destinationChainToken.decimals
    );

    const vUsd = swapFromVUsdReverse(amountToBeReceived, destinationChainToken);
    const resultInt = swapToVUsdReverse(vUsd, sourceChainToken);
    if (resultInt.lte(0)) {
      throw new InsufficientPoolLiquidity();
    }
    return convertIntAmountToFloat(
      resultInt,
      sourceChainToken.decimals
    ).toFixed();
  }

  /**
   * Fetches the amount of units in source chain currency to pay for the swap.
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   * @returns The amount of gas fee to pay for transfer in the smallest denomination of the source chain currency.
   */
  async getTxCost(
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): Promise<string> {
    return this.api.getReceiveTransactionCost({
      sourceChainId: sourceChainToken.allbridgeChainId,
      destinationChainId: destinationChainToken.allbridgeChainId,
      messenger,
    });
  }

  /**
   * Gets the average time in ms to complete a transfer for given tokens and messenger.
   * @param sourceChainToken selected token on the source chain.
   * @param destinationChainToken selected token on the destination chain.
   * @param messenger
   * @returns Average transfer time in milliseconds or null if given combination of tokens and messenger is not supported.
   */
  getAverageTransferTime(
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ): number | null {
    const sourceTxTime = sourceChainToken.txTime[messenger]?.in;
    const destinationTxTime = destinationChainToken.txTime[messenger]?.out;
    if (!sourceTxTime || !destinationTxTime) {
      return null;
    }
    return sourceTxTime + destinationTxTime;
  }
}
