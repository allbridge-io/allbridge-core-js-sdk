import { Big } from "big.js";
import { ChainSymbol } from "./chains";
import { AllbridgeCoreClientImpl } from "./client/core-api";
import { ApiClientImpl } from "./client/core-api/api-client";
import { ApiClientCaching } from "./client/core-api/api-client-caching";
import { TransferStatusResponse } from "./client/core-api/core-api.model";
import { AllbridgeCoreClientPoolInfoCaching } from "./client/core-api/core-client-pool-info-caching";
import { mainnet } from "./configs";
import { CCTPDoesNotSupportedError, InsufficientPoolLiquidityError, NodeRpcUrlNotInitializedError } from "./exceptions";
import {
  AmountFormat,
  AmountFormatted,
  AmountsAndGasFeeOptions,
  ExtraGasMaxLimitResponse,
  GasFeeOptions,
  GetTokenBalanceParams,
  Messenger,
} from "./models";
import { BridgeService, DefaultBridgeService } from "./services/bridge";
import { SolanaBridgeParams } from "./services/bridge/sol";
import { getExtraGasMaxLimits, getGasFeeOptions } from "./services/bridge/utils";
import { DefaultLiquidityPoolService, LiquidityPoolService } from "./services/liquidity-pool";
import { Provider } from "./services/models";
import { DefaultTokenService, TokenService } from "./services/token";
import { ChainDetailsMap, PoolInfo, PoolKeyObject, TokenWithChainDetails } from "./tokens-info";
import { getPoolInfoByToken, validateAmountDecimals } from "./utils";
import {
  aprInPercents,
  convertAmountPrecision,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
} from "./utils/calculation";
import { SendAmountDetails, getSendAmountDetails } from "./utils/calculation/swap-and-bridge-details";
import {
  SwapAndBridgeCalculationData,
  swapAndBridgeFeeCalculation,
  swapAndBridgeFeeCalculationReverse,
} from "./utils/calculation/swap-and-bridge-fee-calc";

export * from "./configs";
export * from "./models";

export interface AllbridgeCoreSdkOptions {
  coreApiUrl: string;
  /**
   * A set of query parameters to be added to all requests to the Core API.
   */
  coreApiQueryParams?: Record<string, string>;
  /**
   * A set of headers to be added to all requests to the Core API.
   */
  coreApiHeaders?: Record<string, string>;
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
}

/**
 * Provide node RPC URL for chain connection you intend to communicate with</br>
 * - required for SOL, TRX chains</br>
 * - optional for EVM chains -- you can interact by passing a {@link Provider} that will be used to communicate with the chain</br>
 */
export type NodeRpcUrls = {
  [key in ChainSymbol]?: string;
};

export class NodeRpcUrlsConfig {
  constructor(private nodeRpcUrls: NodeRpcUrls) {}

  getNodeRpcUrl(chainSymbol: ChainSymbol): string {
    const nodeRpcUrl = this.nodeRpcUrls[chainSymbol];
    if (nodeRpcUrl !== undefined) {
      return nodeRpcUrl;
    } else {
      throw new NodeRpcUrlNotInitializedError(chainSymbol);
    }
  }
}

/**
 * @Deprecated Use {@link NodeRpcUrls}
 */
export interface NodeUrlsConfig {
  solanaRpcUrl: string;
  tronRpcUrl: string;
}

/**
 * @Deprecated Use {@link NodeRpcUrls}
 */
function isNodeUrlsConfig(nodeUrls: NodeUrlsConfig | NodeRpcUrls): nodeUrls is NodeUrlsConfig {
  return "solanaRpcUrl" in nodeUrls;
}

export class AllbridgeCoreSdk {
  /**
   * @internal
   */
  private readonly api: AllbridgeCoreClientPoolInfoCaching;
  /**
   * @internal
   */
  private readonly tokenService: TokenService;

  readonly params: AllbridgeCoreSdkOptions;

  bridge: BridgeService;
  pool: LiquidityPoolService;

  /**
   * Initializes the SDK object.
   * @param nodeUrls node rpc urls for full functionality
   * @param params
   * Optional.
   * If not defined, the default {@link mainnet} parameters are used.
   */
  constructor(nodeUrls: NodeUrlsConfig | NodeRpcUrls, params: AllbridgeCoreSdkOptions = mainnet) {
    let nodeRpcUrlsConfig: NodeRpcUrlsConfig;
    if (isNodeUrlsConfig(nodeUrls)) {
      nodeRpcUrlsConfig = new NodeRpcUrlsConfig({ SOL: nodeUrls.solanaRpcUrl, TRX: nodeUrls.tronRpcUrl });
    } else {
      nodeRpcUrlsConfig = new NodeRpcUrlsConfig(nodeUrls);
    }

    const apiClient = new ApiClientImpl(params);
    const apiClientTokenInfoCaching = new ApiClientCaching(apiClient);
    const coreClient = new AllbridgeCoreClientImpl(apiClientTokenInfoCaching);
    this.api = new AllbridgeCoreClientPoolInfoCaching(coreClient);

    const solBridgeParams: SolanaBridgeParams = {
      wormholeMessengerProgramId: params.wormholeMessengerProgramId,
      solanaLookUpTable: params.solanaLookUpTable,
    };
    this.tokenService = new DefaultTokenService(this.api, nodeRpcUrlsConfig);
    this.bridge = new DefaultBridgeService(this.api, nodeRpcUrlsConfig, solBridgeParams, this.tokenService);
    this.pool = new DefaultLiquidityPoolService(this.api, nodeRpcUrlsConfig, this.tokenService);
    this.params = params;
  }

  /**
   * Returns {@link ChainDetailsMap} containing a list of supported tokens groped by chain.
   */
  async chainDetailsMap(): Promise<ChainDetailsMap> {
    return this.api.getChainDetailsMap();
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens}.
   */
  async tokens(): Promise<TokenWithChainDetails[]> {
    return this.api.tokens();
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens} on the selected chain.
   */
  async tokensByChain(chainSymbol: ChainSymbol): Promise<TokenWithChainDetails[]> {
    const map = await this.api.getChainDetailsMap();
    return map[chainSymbol].tokens;
  }

  /**
   * Fetches information about tokens transfer by chosen chainSymbol and transaction Id from the Allbridge Core API.
   * @param chainSymbol
   * @param txId
   */
  async getTransferStatus(chainSymbol: ChainSymbol, txId: string): Promise<TransferStatusResponse> {
    return this.api.getTransferStatus(chainSymbol, txId);
  }

  /**
   * Get token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    return this.tokenService.getTokenBalance(params, provider);
  }

  /**
   * @Deprecated
   * Calculates the percentage of fee from the initial amount that is charged when swapping from the selected source chain.
   * (Does not include fee related to the destination chain. Does not include gas fee)
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @returns fee percent
   */
  async calculateFeePercentOnSourceChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails
  ): Promise<number> {
    validateAmountDecimals("amountFloat", amountFloat, sourceChainToken.decimals);
    const amountInt = convertFloatAmountToInt(amountFloat, sourceChainToken.decimals);
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(
      amountInt,
      sourceChainToken,
      await getPoolInfoByToken(this.api, sourceChainToken)
    );
    const vUsdInSourcePrecision = fromSystemPrecision(vUsdInSystemPrecision, sourceChainToken.decimals);
    return getFeePercent(amountInt, vUsdInSourcePrecision);
  }

  /**
   * @Deprecated
   * Calculates the percentage of fee that is charged when swapping to the selected destination chain. The destination chain fee percent applies to the amount after the source chain fee.
   * (Does not include fee related to the source chain. Does not include gas fee)
   * @see {@link calculateFeePercentOnSourceChain}
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @returns fee percent
   */
  async calculateFeePercentOnDestinationChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<number> {
    validateAmountDecimals("amountFloat", amountFloat, sourceChainToken.decimals);
    const amountInt = convertFloatAmountToInt(amountFloat, sourceChainToken.decimals);
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(
      amountInt,
      sourceChainToken,
      await getPoolInfoByToken(this.api, sourceChainToken)
    );
    const usd = swapFromVUsd(
      vUsdInSystemPrecision,
      destinationChainToken,
      await getPoolInfoByToken(this.api, destinationChainToken)
    );
    const vUsdInDestinationPrecision = fromSystemPrecision(vUsdInSystemPrecision, destinationChainToken.decimals);
    return getFeePercent(vUsdInDestinationPrecision, usd);
  }

  /**
   * Calculates the amount of tokens to be received as a result of transfer
   * and fetches {@link GasFeeOptions} which contains available ways to pay the gas fee.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   */
  async getAmountToBeReceivedAndGasFeeOptions(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    validateAmountDecimals("amountToSendFloat", amountToSendFloat, sourceChainToken.decimals);
    return {
      amountToSendFloat: Big(amountToSendFloat).toFixed(),
      amountToBeReceivedFloat: await this.getAmountToBeReceived(
        amountToSendFloat,
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
      gasFeeOptions: await this.getGasFeeOptions(sourceChainToken, destinationChainToken, messenger),
    };
  }

  /**
   * Calculates the amount of tokens to send based on requested tokens amount be received as a result of transfer.
   * and fetches {@link GasFeeOptions} which contains available ways to pay the gas fee.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   */
  async getAmountToSendAndGasFeeOptions(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    validateAmountDecimals("amountToBeReceivedFloat", amountToBeReceivedFloat, destinationChainToken.decimals);
    return {
      amountToSendFloat: await this.getAmountToSend(
        amountToBeReceivedFloat,
        sourceChainToken,
        destinationChainToken,
        messenger
      ),
      amountToBeReceivedFloat: Big(amountToBeReceivedFloat).toFixed(),
      gasFeeOptions: await this.getGasFeeOptions(sourceChainToken, destinationChainToken, messenger),
    };
  }

  /**
   * Calculates the amount of tokens to be received as a result of transfer.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger Optional. selected messenger
   */
  async getAmountToBeReceived(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     * Optional.
     * The {@link Messenger.ALLBRIDGE}, {@link Messenger.WORMHOLE} by default.
     */
    messenger?: Messenger
  ): Promise<string> {
    validateAmountDecimals("amountToSendFloat", amountToSendFloat, sourceChainToken.decimals);
    const amountToSend = convertFloatAmountToInt(amountToSendFloat, sourceChainToken.decimals);

    if (messenger && messenger == Messenger.CCTP) {
      if (!sourceChainToken.cctpAddress || !destinationChainToken.cctpAddress || !sourceChainToken.cctpFeeShare) {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
      }
      const result = amountToSend.mul(Big(1).minus(sourceChainToken.cctpFeeShare)).round(0, Big.roundUp);
      const resultInDestPrecision = convertAmountPrecision(
        result,
        sourceChainToken.decimals,
        destinationChainToken.decimals
      ).round(0);
      return convertIntAmountToFloat(resultInDestPrecision, destinationChainToken.decimals).toFixed();
    }

    const vUsd = swapToVUsd(amountToSend, sourceChainToken, await getPoolInfoByToken(this.api, sourceChainToken));
    const resultInt = swapFromVUsd(
      vUsd,
      destinationChainToken,
      await getPoolInfoByToken(this.api, destinationChainToken)
    );
    if (Big(resultInt).lte(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return convertIntAmountToFloat(resultInt, destinationChainToken.decimals).toFixed();
  }

  /**
   * Calculates the amount of tokens to send based on requested tokens amount be received as a result of transfer.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger Optional. selected messenger
   */
  async getAmountToSend(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     * Optional.
     * The {@link Messenger.ALLBRIDGE}, {@link Messenger.WORMHOLE} by default.
     */
    messenger?: Messenger
  ): Promise<string> {
    validateAmountDecimals("amountToBeReceivedFloat", amountToBeReceivedFloat, destinationChainToken.decimals);
    const amountToBeReceived = convertFloatAmountToInt(amountToBeReceivedFloat, destinationChainToken.decimals);

    if (messenger && messenger == Messenger.CCTP) {
      if (!sourceChainToken.cctpAddress || !destinationChainToken.cctpAddress || !sourceChainToken.cctpFeeShare) {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
      }
      const result = amountToBeReceived.div(Big(1).minus(sourceChainToken.cctpFeeShare)).round(0, Big.roundDown);
      const resultInSourcePrecision = convertAmountPrecision(
        result,
        destinationChainToken.decimals,
        sourceChainToken.decimals
      ).round(0);
      return convertIntAmountToFloat(resultInSourcePrecision, sourceChainToken.decimals).toFixed();
    }

    const vUsd = swapFromVUsdReverse(
      amountToBeReceived,
      destinationChainToken,
      await getPoolInfoByToken(this.api, destinationChainToken)
    );
    const resultInt = swapToVUsdReverse(vUsd, sourceChainToken, await getPoolInfoByToken(this.api, sourceChainToken));
    if (Big(resultInt).lte(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return convertIntAmountToFloat(resultInt, sourceChainToken.decimals).toFixed();
  }

  /**
   * Fetches possible ways to pay the transfer gas fee.
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger
   * @returns {@link GasFeeOptions}
   */
  async getGasFeeOptions(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<GasFeeOptions> {
    return getGasFeeOptions(
      sourceChainToken.allbridgeChainId,
      sourceChainToken.chainType,
      destinationChainToken.allbridgeChainId,
      sourceChainToken.decimals,
      messenger,
      this.api
    );
  }

  /**
   * Gets the average time in ms to complete a transfer for given tokens and messenger.
   * @param sourceChainToken selected token on the source chain.
   * @param destinationChainToken selected token on the destination chain.
   * @param messenger
   * @returns Average transfer time in milliseconds or null if a given combination of tokens and messenger is not supported.
   */
  getAverageTransferTime(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): number | null {
    return (
      /* eslint-disable-next-line  @typescript-eslint/no-unnecessary-condition */
      sourceChainToken.transferTime?.[destinationChainToken.chainSymbol]?.[messenger] ?? null
    );
  }

  /**
   * Gets information about the poolInfo by token
   * @param token
   * @returns poolInfo
   */
  async getPoolInfoByToken(token: TokenWithChainDetails): Promise<PoolInfo> {
    return await this.api.getPoolInfoByKey({ chainSymbol: token.chainSymbol, poolAddress: token.poolAddress });
  }

  /**
   * Forces refresh of cached information about the state of liquidity pools.
   * Outdated cache leads to calculated amounts being less accurate.
   * The cache is invalidated at regular intervals, but it can be forced to be refreshed by calling this method.+
   *
   * @param tokens if present, the corresponding liquidity pools will be updated
   */
  async refreshPoolInfo(tokens?: TokenWithChainDetails | TokenWithChainDetails[]): Promise<void> {
    if (tokens) {
      const tokensArray = tokens instanceof Array ? tokens : [tokens];
      const poolKeys: PoolKeyObject[] = tokensArray.map((t) => {
        return { chainSymbol: t.chainSymbol, poolAddress: t.poolAddress };
      });
      return this.api.refreshPoolInfo(poolKeys);
    }
    return this.api.refreshPoolInfo();
  }

  /**
   * Convert APR to percentage view
   * @param apr
   * @returns aprPercentageView
   */
  aprInPercents(apr: number): string {
    return aprInPercents(apr);
  }

  /**
   * Get possible limit of extra gas amount.
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @returns {@link ExtraGasMaxLimitResponse}
   */
  async getExtraGasMaxLimits(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<ExtraGasMaxLimitResponse> {
    return await getExtraGasMaxLimits(sourceChainToken, destinationChainToken, this.api);
  }

  /**
   * @param vUsdAmount - amount of vUsd, int format
   * @param destToken selected token on the destination chain
   * @return amount of destToken
   */
  async getAmountFromVUsd(vUsdAmount: string, destToken: TokenWithChainDetails): Promise<AmountFormatted> {
    const amount = swapFromVUsd(vUsdAmount, destToken, await getPoolInfoByToken(this.api, destToken));
    return {
      [AmountFormat.INT]: amount,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(amount, destToken.decimals).toFixed(),
    };
  }

  /**
   * @Deprecated Use {@link swapAndBridgeDetails}
   * @param amountInTokenPrecision
   * @param sourceToken
   * @param destToken
   */
  async swapAndBridgeFeeCalculation(
    amountInTokenPrecision: string,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SwapAndBridgeCalculationData> {
    return swapAndBridgeFeeCalculation(
      amountInTokenPrecision,
      {
        decimals: sourceToken.decimals,
        feeShare: sourceToken.feeShare,
        poolInfo: await getPoolInfoByToken(this.api, sourceToken),
      },
      {
        decimals: destToken.decimals,
        feeShare: destToken.feeShare,
        poolInfo: await getPoolInfoByToken(this.api, destToken),
      }
    );
  }

  /**
   * @Deprecated Use {@link getAmountToBeReceived} and then {@link swapAndBridgeDetails}
   * @param amountInTokenPrecision
   * @param sourceToken
   * @param destToken
   */
  async swapAndBridgeFeeCalculationReverse(
    amountInTokenPrecision: string,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SwapAndBridgeCalculationData> {
    const result = swapAndBridgeFeeCalculationReverse(
      amountInTokenPrecision,
      {
        decimals: sourceToken.decimals,
        feeShare: sourceToken.feeShare,
        poolInfo: await getPoolInfoByToken(this.api, sourceToken),
      },
      {
        decimals: destToken.decimals,
        feeShare: destToken.feeShare,
        poolInfo: await getPoolInfoByToken(this.api, destToken),
      }
    );
    const newAmount = result.swapFromVUsdCalcResult.amountIncludingCommissionInTokenPrecision;
    if (Big(newAmount).lte(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return result;
  }

  /**
   *  Show amount changes (fee and amount adjustment) during send through pools on source and destination chains
   */
  async getSendAmountDetails(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SendAmountDetails> {
    let amountInTokenPrecision;
    if (amountFormat == AmountFormat.FLOAT) {
      validateAmountDecimals("amount", amount, sourceToken.decimals);
      amountInTokenPrecision = convertFloatAmountToInt(amount, sourceToken.decimals).toFixed();
    } else {
      amountInTokenPrecision = amount;
    }

    return getSendAmountDetails(
      amountInTokenPrecision,
      sourceToken,
      await getPoolInfoByToken(this.api, sourceToken),
      destToken,
      await getPoolInfoByToken(this.api, destToken)
    );
  }
}
