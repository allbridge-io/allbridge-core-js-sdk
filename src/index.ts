import { Big } from "big.js";
import { ChainSymbol } from "./chains";
import { AllbridgeCoreClientImpl } from "./client/core-api";
import { ApiClientImpl } from "./client/core-api/api-client";
import { ApiClientCaching } from "./client/core-api/api-client-caching";
import { TransferStatusResponse } from "./client/core-api/core-api.model";
import { AllbridgeCoreClientPoolInfoCaching } from "./client/core-api/core-client-pool-info-caching";
import { mainnet } from "./configs";
import { InsufficientPoolLiquidityError } from "./exceptions";
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
import { LiquidityPoolService, DefaultLiquidityPoolService } from "./services/liquidity-pool";
import { SolanaPoolParams } from "./services/liquidity-pool/sol";
import { Provider } from "./services/models";
import { TokenService, DefaultTokenService } from "./services/token";
import { ChainDetailsMap, PoolInfo, PoolKeyObject, TokenWithChainDetails } from "./tokens-info";
import { getPoolInfoByToken, validateAmountDecimals } from "./utils";
import {
  aprInPercents,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
} from "./utils/calculation";
import {
  SwapAndBridgeCalculationData,
  swapAndBridgeFeeCalculation,
  swapAndBridgeFeeCalculationReverse,
} from "./utils/calculation/swap-and-bridge-fee-calc";

export * from "./configs/mainnet";
export * from "./models";
export { ChainDetailsMap, ChainDetailsWithTokens } from "./tokens-info";

export interface AllbridgeCoreSdkOptions {
  coreApiUrl: string;
  /**
   * A set of headers to be added to all requests to the Core API.
   */
  coreApiHeaders?: Record<string, string>;
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
}

export interface NodeUrlsConfig {
  solanaRpcUrl: string;
  tronRpcUrl: string;
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
  constructor(nodeUrls: NodeUrlsConfig, params: AllbridgeCoreSdkOptions = mainnet) {
    const apiClient = new ApiClientImpl(params);
    const apiClientTokenInfoCaching = new ApiClientCaching(apiClient);
    const coreClient = new AllbridgeCoreClientImpl(apiClientTokenInfoCaching);
    this.api = new AllbridgeCoreClientPoolInfoCaching(coreClient);

    const solBridgeParams: SolanaBridgeParams = {
      solanaRpcUrl: nodeUrls.solanaRpcUrl,
      wormholeMessengerProgramId: params.wormholeMessengerProgramId,
      solanaLookUpTable: params.solanaLookUpTable,
    };
    this.tokenService = new DefaultTokenService(this.api, solBridgeParams);
    this.bridge = new DefaultBridgeService(this.api, solBridgeParams, this.tokenService);
    const solPoolParams: SolanaPoolParams = {
      solanaRpcUrl: nodeUrls.solanaRpcUrl,
    };
    this.pool = new DefaultLiquidityPoolService(this.api, solPoolParams, this.tokenService, nodeUrls.tronRpcUrl);
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
    validateAmountDecimals("amountFloat", Big(amountFloat).toString(), sourceChainToken.decimals);
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
    validateAmountDecimals("amountFloat", Big(amountFloat).toString(), sourceChainToken.decimals);
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
   * Calculates the amount of tokens the receiving party will get as a result of the transfer
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
    validateAmountDecimals("amountToSendFloat", Big(amountToSendFloat).toString(), sourceChainToken.decimals);
    return {
      amountToSendFloat: Big(amountToSendFloat).toFixed(),
      amountToBeReceivedFloat: await this.getAmountToBeReceived(
        amountToSendFloat,
        sourceChainToken,
        destinationChainToken
      ),
      gasFeeOptions: await this.getGasFeeOptions(sourceChainToken, destinationChainToken, messenger),
    };
  }

  /**
   * Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a result of the swap
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
    validateAmountDecimals(
      "amountToBeReceivedFloat",
      Big(amountToBeReceivedFloat).toString(),
      destinationChainToken.decimals
    );
    return {
      amountToSendFloat: await this.getAmountToSend(amountToBeReceivedFloat, sourceChainToken, destinationChainToken),
      amountToBeReceivedFloat: Big(amountToBeReceivedFloat).toFixed(),
      gasFeeOptions: await this.getGasFeeOptions(sourceChainToken, destinationChainToken, messenger),
    };
  }

  /**
   * Calculates the amount of tokens the receiving party will get as a result of the swap.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   */
  async getAmountToBeReceived(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<string> {
    validateAmountDecimals("amountToSendFloat", Big(amountToSendFloat).toString(), sourceChainToken.decimals);
    const amountToSend = convertFloatAmountToInt(amountToSendFloat, sourceChainToken.decimals);

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
   * Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a result of the swap.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   */
  async getAmountToSend(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<string> {
    validateAmountDecimals(
      "amountToBeReceivedFloat",
      Big(amountToBeReceivedFloat).toString(),
      destinationChainToken.decimals
    );
    const amountToBeReceived = convertFloatAmountToInt(amountToBeReceivedFloat, destinationChainToken.decimals);
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
   * @return amount of destToken
   */
  async getAmountFromVUsd(vUsdAmount: string, destToken: TokenWithChainDetails): Promise<AmountFormatted> {
    const amount = swapFromVUsd(vUsdAmount, destToken, await getPoolInfoByToken(this.api, destToken));
    return {
      [AmountFormat.INT]: amount,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(amount, destToken.decimals).toFixed(),
    };
  }

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

  async swapAndBridgeFeeCalculationReverse(
    amountInTokenPrecision: string,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SwapAndBridgeCalculationData> {
    return swapAndBridgeFeeCalculationReverse(
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
}
