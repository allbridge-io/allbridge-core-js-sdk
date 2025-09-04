import { Big } from "big.js";
import { Chains } from "../chains";
import { ApiClientImpl } from "../client/core-api/api-client";
import { ApiClientCaching } from "../client/core-api/api-client-caching";
import {
  AddressStatus,
  CheckAddressResponse,
  GasBalanceResponse,
  Messenger,
  PendingInfoDTO,
  TransferStatusResponse,
} from "../client/core-api/core-api.model";
import { AllbridgeCoreClientImpl } from "../client/core-api/core-client-base";
import { AllbridgeCoreClientFiltered, AllbridgeCoreClientFilteredImpl } from "../client/core-api/core-client-filtered";
import { AllbridgeCoreClientPoolInfoCaching } from "../client/core-api/core-client-pool-info-caching";
import { mainnet } from "../configs";
import {
  AllbridgeCoreSdkOptions,
  BasicChainProperties,
  NodeRpcUrls,
  OFTDoesNotSupportedError,
  SdkError,
} from "../index";
import {
  AmountFormat,
  AmountFormatted,
  AmountsAndGasFeeOptions,
  CCTPDoesNotSupportedError,
  ExtraGasMaxLimitResponse,
  GasFeeOptions,
  GetTokenBalanceParams,
  InsufficientPoolLiquidityError,
  NodeRpcUrlNotInitializedError,
  PendingStatusInfoResponse,
  Provider,
  SendAmountDetails,
  SwapAndBridgeCalculationData,
} from "../models";
import { ChainDetailsMap, PoolInfo, PoolKeyObject, TokenWithChainDetails } from "../tokens-info";
import {
  aprInPercents,
  convertAmountPrecision,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  getSwapFromVUsdPoolInfo,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
} from "../utils/calculation";
import { SYSTEM_PRECISION } from "../utils/calculation/constants";
import { getSendAmountDetails } from "../utils/calculation/swap-and-bridge-details";
import {
  swapAndBridgeFeeCalculation,
  swapAndBridgeFeeCalculationReverse,
} from "../utils/calculation/swap-and-bridge-fee-calc";
import { getPoolInfoByToken, validateAmountDecimals, validateAmountGtZero } from "../utils/utils";
import { BridgeService, DefaultBridgeService } from "./bridge";
import { GetNativeTokenBalanceParams } from "./bridge/models";
import { getExtraGasMaxLimits, getGasFeeOptions } from "./bridge/utils";
import { DefaultLiquidityPoolService, LiquidityPoolService } from "./liquidity-pool";
import { DefaultTokenService, TokenService } from "./token";
import { DefaultYieldService, YieldService } from "./yield";

export class NodeRpcUrlsConfig {
  constructor(private nodeRpcUrls: NodeRpcUrls) {}

  getNodeRpcUrl(chainSymbol: string): string {
    const nodeRpcUrl = this.nodeRpcUrls[chainSymbol];
    if (nodeRpcUrl !== undefined) {
      return nodeRpcUrl;
    } else {
      throw new NodeRpcUrlNotInitializedError(chainSymbol);
    }
  }
}

export class AllbridgeCoreSdkService {
  readonly api: AllbridgeCoreClientFiltered;

  private readonly tokenService: TokenService;

  readonly params: AllbridgeCoreSdkOptions;

  bridge: BridgeService;
  pool: LiquidityPoolService;
  yield: YieldService;

  constructor(
    public readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    params: AllbridgeCoreSdkOptions = mainnet
  ) {
    Chains.addChainsProperties(params.additionalChainsProperties as Record<string, BasicChainProperties>);
    const apiClient = new ApiClientImpl(params);
    const apiClientCaching = new ApiClientCaching(apiClient);
    const coreClient = new AllbridgeCoreClientImpl(apiClientCaching);
    const coreClientPoolInfoCaching = new AllbridgeCoreClientPoolInfoCaching(coreClient);
    this.api = new AllbridgeCoreClientFilteredImpl(coreClientPoolInfoCaching, params);
    this.tokenService = new DefaultTokenService(this.api, nodeRpcUrlsConfig, params);
    this.bridge = new DefaultBridgeService(this.api, nodeRpcUrlsConfig, params, this.tokenService);
    this.pool = new DefaultLiquidityPoolService(this.api, nodeRpcUrlsConfig, params, this.tokenService);
    this.yield = new DefaultYieldService(this.api, nodeRpcUrlsConfig, params, this.tokenService);
    this.params = params;
  }

  async chainDetailsMap(type: "swap" | "pool"): Promise<ChainDetailsMap> {
    return this.api.getChainDetailsMap(type);
  }

  async tokens(type: "swap" | "pool"): Promise<TokenWithChainDetails[]> {
    return this.api.tokens(type);
  }

  async tokensByChain(chainSymbol: string, type: "swap" | "pool"): Promise<TokenWithChainDetails[]> {
    const map = await this.api.getChainDetailsMap(type);
    const chainDetails = map[chainSymbol];
    if (!chainDetails) {
      return [];
    }
    return chainDetails.tokens;
  }

  async getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse> {
    return this.api.getTransferStatus(chainSymbol, txId);
  }

  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    return this.api.getGasBalance(chainSymbol, address);
  }

  async checkAddress(): Promise<CheckAddressResponse> {
    return new Promise((resolve) => {
      resolve({
        status: AddressStatus.OK,
        gasBalance: null,
      });
    });
  }

  async getPendingStatusInfo(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<PendingStatusInfoResponse> {
    validateAmountGtZero(amount);
    let amountInTokenPrecision;
    if (amountFormat == AmountFormat.FLOAT) {
      validateAmountDecimals("amount", amount, sourceToken.decimals);
      amountInTokenPrecision = convertFloatAmountToInt(amount, sourceToken.decimals).toFixed();
    } else {
      amountInTokenPrecision = amount;
    }

    const vUsdAmountInt = swapToVUsd(
      amountInTokenPrecision,
      sourceToken,
      await getPoolInfoByToken(this.api, sourceToken)
    );
    const destPoolInfo = await getPoolInfoByToken(this.api, destToken);
    const amountResultIntFormatted: AmountFormatted = this.getAmountFromVUsdFormatted(
      vUsdAmountInt,
      destToken,
      destPoolInfo
    );

    let pendingInfoDTO: PendingInfoDTO | undefined;
    const pendingInfo = await this.api.getPendingInfo();
    for (const tokenAddress in pendingInfo[destToken.chainSymbol]) {
      const info = pendingInfo[destToken.chainSymbol];
      if (!info) {
        throw new SdkError("Cannot find pending info for " + destToken.chainSymbol);
      }
      pendingInfoDTO = info[tokenAddress];
    }
    if (pendingInfoDTO) {
      const destPoolAfterPending = getSwapFromVUsdPoolInfo(pendingInfoDTO.totalSentAmount, destPoolInfo);
      const amountResultIntAfterPendingFormatted: AmountFormatted = this.getAmountFromVUsdFormatted(
        vUsdAmountInt,
        destToken,
        destPoolAfterPending
      );

      let estimatedAmount: { min: AmountFormatted; max: AmountFormatted };
      if (Big(amountResultIntAfterPendingFormatted.int).gt(amountResultIntFormatted.int)) {
        estimatedAmount = { min: amountResultIntFormatted, max: amountResultIntAfterPendingFormatted };
      } else {
        estimatedAmount = { min: amountResultIntAfterPendingFormatted, max: amountResultIntFormatted };
      }

      return {
        pendingTxs: pendingInfoDTO.pendingTxs,
        pendingAmount: {
          [AmountFormat.INT]: convertAmountPrecision(
            pendingInfoDTO.totalSentAmount,
            SYSTEM_PRECISION,
            destToken.decimals
          ).toFixed(0),
          [AmountFormat.FLOAT]: convertIntAmountToFloat(pendingInfoDTO.totalSentAmount, SYSTEM_PRECISION).toFixed(),
        },
        estimatedAmount,
      };
    }
    return {
      pendingTxs: 0,
      pendingAmount: {
        [AmountFormat.INT]: "0",
        [AmountFormat.FLOAT]: "0",
      },
      estimatedAmount: {
        min: amountResultIntFormatted,
        max: amountResultIntFormatted,
      },
    };
  }

  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    return this.tokenService.getTokenBalance(params, provider);
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams, provider?: Provider): Promise<AmountFormatted> {
    return this.tokenService.getNativeTokenBalance(params, provider);
  }

  async calculateFeePercentOnSourceChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails
  ): Promise<number> {
    validateAmountGtZero(amountFloat);
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

  async calculateFeePercentOnDestinationChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<number> {
    validateAmountGtZero(amountFloat);
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

  async getAmountToBeReceivedAndGasFeeOptions(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    validateAmountGtZero(amountToSendFloat);
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

  async getAmountToSendAndGasFeeOptions(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    validateAmountGtZero(amountToBeReceivedFloat);
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

  async getAmountToBeReceived(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<string> {
    return this.getAmountToBeReceivedCompute(
      amountToSendFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      async () => await getPoolInfoByToken(this.api, sourceChainToken),
      async () => await getPoolInfoByToken(this.api, destinationChainToken)
    );
  }

  async getAmountToBeReceivedFromChain(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger,
    sourceProvider?: Provider,
    destinationProvider?: Provider
  ): Promise<string> {
    return this.getAmountToBeReceivedCompute(
      amountToSendFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      async () => await this.pool.getPoolInfoFromChain(sourceChainToken, sourceProvider),
      async () => await this.pool.getPoolInfoFromChain(destinationChainToken, destinationProvider)
    );
  }

  async getAmountToBeReceivedCompute(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger = Messenger.ALLBRIDGE,
    sourcePool: () => Promise<PoolInfo>,
    destPool: () => Promise<PoolInfo>
  ): Promise<string> {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE: {
        return this.getAmountToBeReceivedComputeWithPools(
          amountToSendFloat,
          sourceChainToken,
          destinationChainToken,
          await sourcePool(),
          await destPool()
        );
      }
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        return this.getAmountToBeReceivedComputeCctp(
          amountToSendFloat,
          sourceChainToken,
          destinationChainToken,
          messenger
        );
      case Messenger.OFT:
        return this.getAmountToBeReceivedComputeOft(amountToSendFloat, sourceChainToken, destinationChainToken);
    }
  }

  getAmountToBeReceivedComputeWithPools(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    sourcePool: PoolInfo,
    destinationPool: PoolInfo
  ): string {
    validateAmountGtZero(amountToSendFloat);
    validateAmountDecimals("amountToSendFloat", amountToSendFloat, sourceChainToken.decimals);
    const amountToSend = convertFloatAmountToInt(amountToSendFloat, sourceChainToken.decimals);

    const vUsd = swapToVUsd(amountToSend, sourceChainToken, sourcePool);
    return this.getAmountFromVUsdFormatted(vUsd, destinationChainToken, destinationPool).float;
  }

  getAmountToBeReceivedComputeCctp(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger.CCTP | Messenger.CCTP_V2
  ): string {
    validateAmountGtZero(amountToSendFloat);
    validateAmountDecimals("amountToSendFloat", amountToSendFloat, sourceChainToken.decimals);
    const amountToSend = convertFloatAmountToInt(amountToSendFloat, sourceChainToken.decimals);

    switch (messenger) {
      case Messenger.CCTP: {
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
      case Messenger.CCTP_V2: {
        if (
          !sourceChainToken.cctpV2Address ||
          !destinationChainToken.cctpV2Address ||
          !sourceChainToken.cctpV2FeeShare
        ) {
          throw new CCTPDoesNotSupportedError("Such route does not support CCTP V2 protocol");
        }
        const result = amountToSend.mul(Big(1).minus(sourceChainToken.cctpV2FeeShare)).round(0, Big.roundUp);
        const resultInDestPrecision = convertAmountPrecision(
          result,
          sourceChainToken.decimals,
          destinationChainToken.decimals
        ).round(0);

        return convertIntAmountToFloat(resultInDestPrecision, destinationChainToken.decimals).toFixed();
      }
    }
  }

  async getAmountToBeReceivedComputeOft(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<string> {
    validateAmountGtZero(amountToSendFloat);
    validateAmountDecimals("amountToSendFloat", amountToSendFloat, sourceChainToken.decimals);
    const amountToSend = convertFloatAmountToInt(amountToSendFloat, sourceChainToken.decimals);

    if (
      !sourceChainToken.oftBridgeAddress ||
      !destinationChainToken.oftBridgeAddress ||
      sourceChainToken.oftId !== destinationChainToken.oftId
    ) {
      throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
    }
    const { adminFeeShareWithExtras } = await this.api.getReceiveTransactionCost({
      sourceChainId: sourceChainToken.allbridgeChainId,
      destinationChainId: destinationChainToken.allbridgeChainId,
      messenger: Messenger.OFT,
      sourceToken: sourceChainToken.tokenAddress,
    });
    if (!adminFeeShareWithExtras) {
      throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
    }
    const result = amountToSend.mul(Big(1).minus(adminFeeShareWithExtras)).round(0, Big.roundUp);
    const resultInDestPrecision = convertAmountPrecision(
      result,
      sourceChainToken.decimals,
      destinationChainToken.decimals
    ).round(0);

    return convertIntAmountToFloat(resultInDestPrecision, destinationChainToken.decimals).toFixed();
  }

  async getAmountToSend(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<string> {
    return this.getAmountToSendCompute(
      amountToBeReceivedFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      () => getPoolInfoByToken(this.api, sourceChainToken),
      () => getPoolInfoByToken(this.api, destinationChainToken)
    );
  }

  async getAmountToSendFromChain(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger,
    sourceProvider?: Provider,
    destinationProvider?: Provider
  ): Promise<string> {
    return this.getAmountToSendCompute(
      amountToBeReceivedFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      () => this.pool.getPoolInfoFromChain(sourceChainToken, sourceProvider),
      () => this.pool.getPoolInfoFromChain(destinationChainToken, destinationProvider)
    );
  }

  async getAmountToSendCompute(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger = Messenger.ALLBRIDGE,
    sourcePool: () => Promise<PoolInfo>,
    destPool: () => Promise<PoolInfo>
  ): Promise<string> {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE: {
        return this.getAmountToSendComputeWithPools(
          amountToBeReceivedFloat,
          sourceChainToken,
          destinationChainToken,
          await sourcePool(),
          await destPool()
        );
      }
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        return this.getAmountToSendComputeCctp(
          amountToBeReceivedFloat,
          sourceChainToken,
          destinationChainToken,
          messenger
        );
      case Messenger.OFT:
        return this.getAmountToSendComputeOft(amountToBeReceivedFloat, sourceChainToken, destinationChainToken);
    }
  }

  getAmountToSendComputeWithPools(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    sourcePool: PoolInfo,
    destinationPool: PoolInfo
  ): string {
    validateAmountGtZero(amountToBeReceivedFloat);
    validateAmountDecimals("amountToBeReceivedFloat", amountToBeReceivedFloat, destinationChainToken.decimals);
    const amountToBeReceived = convertFloatAmountToInt(amountToBeReceivedFloat, destinationChainToken.decimals);

    const vUsd = swapFromVUsdReverse(amountToBeReceived, destinationChainToken, destinationPool);
    const resultInt = swapToVUsdReverse(vUsd, sourceChainToken, sourcePool);
    if (Big(resultInt).lte(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return convertIntAmountToFloat(resultInt, sourceChainToken.decimals).toFixed();
  }

  getAmountToSendComputeCctp(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger.CCTP | Messenger.CCTP_V2
  ): string {
    validateAmountGtZero(amountToBeReceivedFloat);
    validateAmountDecimals("amountToBeReceivedFloat", amountToBeReceivedFloat, destinationChainToken.decimals);
    const amountToBeReceived = convertFloatAmountToInt(amountToBeReceivedFloat, destinationChainToken.decimals);

    switch (messenger) {
      case Messenger.CCTP: {
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
      case Messenger.CCTP_V2: {
        if (
          !sourceChainToken.cctpV2Address ||
          !destinationChainToken.cctpV2Address ||
          !sourceChainToken.cctpV2FeeShare
        ) {
          throw new CCTPDoesNotSupportedError("Such route does not support CCTP V2 protocol");
        }
        const result = amountToBeReceived.div(Big(1).minus(sourceChainToken.cctpV2FeeShare)).round(0, Big.roundDown);
        const resultInSourcePrecision = convertAmountPrecision(
          result,
          destinationChainToken.decimals,
          sourceChainToken.decimals
        ).round(0);
        return convertIntAmountToFloat(resultInSourcePrecision, sourceChainToken.decimals).toFixed();
      }
    }
  }

  async getAmountToSendComputeOft(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<string> {
    validateAmountGtZero(amountToBeReceivedFloat);
    validateAmountDecimals("amountToBeReceivedFloat", amountToBeReceivedFloat, destinationChainToken.decimals);
    const amountToBeReceived = convertFloatAmountToInt(amountToBeReceivedFloat, destinationChainToken.decimals);

    if (
      !sourceChainToken.oftId ||
      !destinationChainToken.oftId ||
      !sourceChainToken.oftBridgeAddress ||
      sourceChainToken.oftId !== destinationChainToken.oftId
    ) {
      throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
    }
    const { adminFeeShareWithExtras } = await this.api.getReceiveTransactionCost({
      sourceChainId: sourceChainToken.allbridgeChainId,
      destinationChainId: destinationChainToken.allbridgeChainId,
      messenger: Messenger.OFT,
      sourceToken: sourceChainToken.tokenAddress,
    });
    if (!adminFeeShareWithExtras) {
      throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
    }
    const result = amountToBeReceived.div(Big(1).minus(adminFeeShareWithExtras)).round(0, Big.roundDown);
    const resultInSourcePrecision = convertAmountPrecision(
      result,
      destinationChainToken.decimals,
      sourceChainToken.decimals
    ).round(0);
    return convertIntAmountToFloat(resultInSourcePrecision, sourceChainToken.decimals).toFixed();
  }

  async getGasFeeOptions(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<GasFeeOptions> {
    return getGasFeeOptions(sourceChainToken, destinationChainToken.allbridgeChainId, messenger, this.api);
  }

  getAverageTransferTime(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): number | null {
    return sourceChainToken.transferTime?.[destinationChainToken.chainSymbol]?.[messenger] ?? null;
  }

  async getPoolInfoByToken(token: TokenWithChainDetails): Promise<PoolInfo> {
    return await this.api.getPoolInfoByKey({ chainSymbol: token.chainSymbol, poolAddress: token.poolAddress });
  }

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

  aprInPercents(apr: string): string {
    return aprInPercents(apr);
  }

  async getExtraGasMaxLimits(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<ExtraGasMaxLimitResponse> {
    return await getExtraGasMaxLimits(sourceChainToken, destinationChainToken, messenger, this.api);
  }

  async getVUsdFromAmount(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails
  ): Promise<AmountFormatted> {
    validateAmountGtZero(amount);
    let amountInTokenPrecision;
    if (amountFormat == AmountFormat.FLOAT) {
      validateAmountDecimals("amount", amount, sourceToken.decimals);
      amountInTokenPrecision = convertFloatAmountToInt(amount, sourceToken.decimals).toFixed();
    } else {
      amountInTokenPrecision = amount;
    }

    const vUsdAmount = swapToVUsd(amountInTokenPrecision, sourceToken, await getPoolInfoByToken(this.api, sourceToken));
    return {
      [AmountFormat.INT]: vUsdAmount,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(vUsdAmount, SYSTEM_PRECISION).toFixed(),
    };
  }

  async getAmountFromVUsd(vUsdAmount: string, destToken: TokenWithChainDetails): Promise<AmountFormatted> {
    return this.getAmountFromVUsdFormatted(vUsdAmount, destToken, await getPoolInfoByToken(this.api, destToken));
  }

  private getAmountFromVUsdFormatted(
    vUsdAmountInt: string,
    destToken: TokenWithChainDetails,
    destPoolInfo: Pick<PoolInfo, "vUsdBalance" | "aValue" | "dValue" | "tokenBalance">
  ): AmountFormatted {
    validateAmountGtZero(vUsdAmountInt);
    const amountResultInt = swapFromVUsd(vUsdAmountInt, destToken, destPoolInfo);
    if (Big(amountResultInt).lt(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return {
      [AmountFormat.INT]: amountResultInt,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(amountResultInt, destToken.decimals).toFixed(),
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
    if (Big(newAmount).lt(0)) {
      throw new InsufficientPoolLiquidityError();
    }
    return result;
  }

  async getSendAmountDetails(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SendAmountDetails> {
    validateAmountGtZero(amount);
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
