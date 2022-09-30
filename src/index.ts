import { Big, BigSource } from "big.js";
import Web3 from "web3";
import { BridgeService } from "./bridge";
import {
  ApproveData,
  ChainSymbolsSendParams,
  TokensInfoSendParams,
  TransactionResponse,
} from "./bridge/models";
import { AllbridgeCoreClient } from "./client/core-api";
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
export * from "./models";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  private api: AllbridgeCoreClient;
  private bridgeService: BridgeService;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.api = new AllbridgeCoreClient({ apiUrl: params.apiUrl });
    this.bridgeService = new BridgeService(this.api);
  }

  async getTokensInfo(): Promise<TokensInfo> {
    return this.api.getTokensInfo();
  }

  /**
   * Method to approve tokens on evm chains
   * @param web3
   * @param approveData
   */
  async evmApprove(
    web3: Web3,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return this.bridgeService.evmApprove(web3, approveData);
  }

  /**
   * Method to send tokens through the Bridge
   * @param web3
   * @param params
   */
  async send(
    web3: Web3,
    params: ChainSymbolsSendParams | TokensInfoSendParams
  ): Promise<TransactionResponse> {
    return this.bridgeService.send(web3, params);
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
      txCost: await this.getTxCost(
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
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
      txCost: await this.getTxCost(
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
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

  async getTxCost(
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails,
    messenger: Messenger
  ) {
    return await this.api.getReceiveTransactionCost({
      sourceChainId: sourceChainToken.allbridgeChainId,
      destinationChainId: destinationChainToken.allbridgeChainId,
      messenger,
    });
  }
}
