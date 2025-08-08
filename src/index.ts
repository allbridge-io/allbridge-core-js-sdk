import { BigSource } from "big.js";
import { AdditionalBasicChainProperties } from "./chains/models";
import { mainnet } from "./configs";
import {
  AmountFormat,
  AmountFormatted,
  AmountsAndGasFeeOptions,
  BridgeService,
  ChainDetailsMap,
  CheckAddressResponse,
  ExtraGasMaxLimitResponse,
  GasBalanceResponse,
  GasFeeOptions,
  GetNativeTokenBalanceParams,
  GetTokenBalanceParams,
  LiquidityPoolService,
  Messenger,
  PendingStatusInfoResponse,
  PoolInfo,
  Provider,
  SendAmountDetails,
  SwapAndBridgeCalculationData,
  TokenWithChainDetails,
  TransferStatusResponse,
} from "./models";
import { AllbridgeCoreSdkService, NodeRpcUrlsConfig } from "./services";
import { CctpParams } from "./services/bridge/sol";
import { DefaultUtils, Utils } from "./utils";

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
  /**
   * Jupiter Swap Api</br>
   * Default: https://lite-api.jup.ag/swap/v1</br>
   * {@link https://dev.jup.ag/docs/swap-api/}
   */
  jupiterUrl: string;
  /**
   * Jupiter Api Key Header</br>
   * {@link https://dev.jup.ag/docs/api-setup}
   */
  jupiterApiKeyHeader?: string;
  /**
   * Jupiter v6 'maxAccounts' parameter</br>
   * Rough estimate of the max accounts to be used for the quote, so that you can compose with your own accounts</br>
   * {@link https://station.jup.ag/docs/apis/swap-api#using-maxaccounts}
   */
  jupiterMaxAccounts?: number;
  wormholeMessengerProgramId: string;
  solanaLookUpTable: string;
  sorobanNetworkPassphrase: string;
  /**
   * Optional. Will be used in methods</br>
   * {@link LiquidityPoolService.getPoolInfoFromChain} and {@link LiquidityPoolService.getAmountToBeWithdrawn}</br>
   * to fetch information from the blockchain with fewer HTTP requests using JSON-RPC API
   */
  tronJsonRpc?: string;
  cctpParams: CctpParams;
  /**
   * The number of seconds that pool information taken from the chain will be cached.
   *
   * @type {number}
   */
  cachePoolInfoChainSec: number;

  /**
   * @internal
   * Optional additional properties to merge with the default properties.
   */
  additionalChainsProperties?: Record<string, AdditionalBasicChainProperties>;
}

/**
 * Type representing RPC node URLs for different blockchain chains.</br>
 * Provide node RPC URL for chain connection you intend to communicate with</br>
 * - required for SOL, TRX chains</br>
 * - optional for EVM chains -- you can interact by passing a {@link Provider} that will be used to communicate with the chain</br>
 * @typedef {Record<string, string>} NodeRpcUrls
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {string} rpcUrl - The RPC node URL for the specified chain.
 */
export type NodeRpcUrls = Record<string, string>;

/**
 * @deprecated Use {@link NodeRpcUrls}
 */
export interface NodeUrlsConfig {
  solanaRpcUrl: string;
  tronRpcUrl: string;
}

/**
 * @deprecated Use {@link NodeRpcUrls}
 */
function isNodeUrlsConfig(nodeUrls: NodeUrlsConfig | NodeRpcUrls): nodeUrls is NodeUrlsConfig {
  return "solanaRpcUrl" in nodeUrls;
}

export class AllbridgeCoreSdk {
  readonly params: AllbridgeCoreSdkOptions;

  bridge: BridgeService;
  pool: LiquidityPoolService;
  utils: Utils;

  private service: AllbridgeCoreSdkService;

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
    this.service = new AllbridgeCoreSdkService(nodeRpcUrlsConfig, params);
    this.bridge = this.service.bridge;
    this.pool = this.service.pool;
    this.utils = new DefaultUtils(this.service);
    this.params = params;
  }

  /**
   * Returns {@link ChainDetailsMap} containing a list of supported tokens groped by chain.
   *
   * @param type - A string value which specifies ChainDetailsMap to retrieve.
   *               Can be either 'swap' for send or 'pool' for liquidity pools setup.
   *               Defaults to 'swap'.
   */
  async chainDetailsMap(type: "swap" | "pool" = "swap"): Promise<ChainDetailsMap> {
    return this.service.chainDetailsMap(type);
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens}.
   *
   * @param type - A string value which specifies a set of tokens to retrieve.
   *               Can be either 'swap' for tokens to send or 'pool' for liquidity pools operations.
   *               Defaults to 'swap'.
   * @returns A promise that resolves to an array of {@link TokenWithChainDetails}.
   */
  async tokens(type: "swap" | "pool" = "swap"): Promise<TokenWithChainDetails[]> {
    return this.service.tokens(type);
  }

  /**
   * Returns a list of supported {@link TokenWithChainDetails | tokens} on the selected chain.
   * @param chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   * @param type - A string value which specifies a set of tokens to retrieve.
   *               Can be either 'swap' for tokens to send or 'pool' for liquidity pools operations.
   *               Defaults to 'swap'.
   */
  async tokensByChain(chainSymbol: string, type: "swap" | "pool" = "swap"): Promise<TokenWithChainDetails[]> {
    return this.service.tokensByChain(chainSymbol, type);
  }

  /**
   * Fetches information about tokens transfer by chosen chainSymbol and transaction Id from the Allbridge Core API.
   * @param chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   * @param txId
   */
  async getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse> {
    return this.service.getTransferStatus(chainSymbol, txId);
  }

  /**
   * Get gas balance
   * @param chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   * @param address
   */
  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    return this.service.getGasBalance(chainSymbol, address);
  }

  /**
   * Check address and show gas balance
   * @deprecated
   * @param chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
   * @param recipientAddress
   * @param tokenAddress
   */
  async checkAddress(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chainSymbol: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    recipientAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenAddress?: string
  ): Promise<CheckAddressResponse> {
    return await this.service.checkAddress();
  }

  /**
   * Returns information about pending transactions for the same destination chain and the amount of tokens can be received as a result of transfer considering pending transactions.
   * @param amount the amount of tokens that will be sent
   * @param amountFormat amount format
   * @param sourceToken selected token transfer from
   * @param destToken selected token transfer to
   * @returns range of possible amount based on already pending transactions
   */
  async getPendingStatusInfo(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<PendingStatusInfoResponse> {
    return this.service.getPendingStatusInfo(amount, amountFormat, sourceToken, destToken);
  }

  /**
   * Get token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  async getTokenBalance(params: GetTokenBalanceParams, provider?: Provider): Promise<string> {
    return this.service.getTokenBalance(params, provider);
  }

  /**
   * Get native (gas) token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  async getNativeTokenBalance(params: GetNativeTokenBalanceParams, provider?: Provider): Promise<AmountFormatted> {
    return this.service.getNativeTokenBalance(params, provider);
  }

  /**
   * @deprecated
   * Calculates the percentage of fee from the initial amount that is charged when swapping from the selected source chain.
   * (Does not include fee related to the destination chain. Does not include gas fee)
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @returns fee percent
   */
  async calculateFeePercentOnSourceChain(
    amountFloat: BigSource,
    sourceChainToken: TokenWithChainDetails
  ): Promise<number> {
    return this.service.calculateFeePercentOnSourceChain(amountFloat, sourceChainToken);
  }

  /**
   * @deprecated
   * Calculates the percentage of fee that is charged when swapping to the selected destination chain. The destination chain fee percent applies to the amount after the source chain fee.
   * (Does not include fee related to the source chain. Does not include gas fee)
   * @see {@link calculateFeePercentOnSourceChain}
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @returns fee percent
   */
  async calculateFeePercentOnDestinationChain(
    amountFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails
  ): Promise<number> {
    return this.service.calculateFeePercentOnDestinationChain(amountFloat, sourceChainToken, destinationChainToken);
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
    amountToSendFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    return this.service.getAmountToBeReceivedAndGasFeeOptions(
      amountToSendFloat,
      sourceChainToken,
      destinationChainToken,
      messenger
    );
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
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger
  ): Promise<AmountsAndGasFeeOptions> {
    return this.service.getAmountToSendAndGasFeeOptions(
      amountToBeReceivedFloat,
      sourceChainToken,
      destinationChainToken,
      messenger
    );
  }

  /**
   * Calculates the amount of tokens to be received as a result of transfer.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger selected messenger
   */
  async getAmountToBeReceived(
    amountToSendFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     */
    messenger: Messenger = Messenger.ALLBRIDGE
  ): Promise<string> {
    return this.service.getAmountToBeReceived(amountToSendFloat, sourceChainToken, destinationChainToken, messenger);
  }

  /**
   * Calculates the amount of tokens to be received as a result of transfer based on actual blockchain pool state.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger selected messenger
   * @param sourceProvider Optional. source chain Provider
   * @param destinationProvider Optional. destination chain Provider
   */
  async getAmountToBeReceivedFromChain(
    amountToSendFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     */
    messenger: Messenger = Messenger.ALLBRIDGE,
    sourceProvider?: Provider,
    destinationProvider?: Provider
  ): Promise<string> {
    return this.service.getAmountToBeReceivedFromChain(
      amountToSendFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      sourceProvider,
      destinationProvider
    );
  }

  /**
   * Calculates the amount of tokens to be received as a result of transfer based on passed pool state.
   * @param amountToSendFloat the amount of tokens that will be sent
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param sourcePool source token pool state
   * @param destinationPool destination token pool state
   * @param messenger selected messenger
   */
  getAmountToBeReceivedFromPools(
    amountToSendFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    sourcePool: PoolInfo,
    destinationPool: PoolInfo,
    messenger: Exclude<Messenger, Messenger.OFT> = Messenger.ALLBRIDGE
  ): string {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE:
        return this.service.getAmountToBeReceivedComputeWithPools(
          amountToSendFloat,
          sourceChainToken,
          destinationChainToken,
          sourcePool,
          destinationPool
        );
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        return this.service.getAmountToBeReceivedComputeCctp(
          amountToSendFloat,
          sourceChainToken,
          destinationChainToken,
          messenger
        );
    }
  }

  /**
   * Calculates the amount of tokens to send based on requested tokens amount be received as a result of transfer.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger selected messenger
   */
  async getAmountToSend(
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     */
    messenger: Messenger = Messenger.ALLBRIDGE
  ): Promise<string> {
    return this.service.getAmountToSend(amountToBeReceivedFloat, sourceChainToken, destinationChainToken, messenger);
  }

  /**
   * Calculates the amount of tokens to send based on requested tokens amount be received as a result of transfer based on actual blockchain pool state.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger selected messenger
   * @param sourceProvider Optional. source chain Provider
   * @param destinationProvider Optional. destination chain Provider
   */
  async getAmountToSendFromChain(
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    /**
     * The Messengers for different routes.
     */
    messenger: Messenger = Messenger.ALLBRIDGE,
    sourceProvider?: Provider,
    destinationProvider?: Provider
  ): Promise<string> {
    return this.service.getAmountToSendFromChain(
      amountToBeReceivedFloat,
      sourceChainToken,
      destinationChainToken,
      messenger,
      sourceProvider,
      destinationProvider
    );
  }

  /**
   * Calculates the amount of tokens to send based on requested tokens amount be received as a result of transfer based on passed pool state.
   * @param amountToBeReceivedFloat the amount of tokens that should be received
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param sourcePool source token pool state
   * @param destinationPool destination token pool state
   * @param messenger selected messenger
   */
  getAmountToSendFromPools(
    amountToBeReceivedFloat: BigSource,
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    sourcePool: PoolInfo,
    destinationPool: PoolInfo,
    messenger: Exclude<Messenger, Messenger.OFT> = Messenger.ALLBRIDGE
  ): string {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE:
        return this.service.getAmountToSendComputeWithPools(
          amountToBeReceivedFloat,
          sourceChainToken,
          destinationChainToken,
          sourcePool,
          destinationPool
        );
      case Messenger.CCTP:
      case Messenger.CCTP_V2:
        return this.service.getAmountToSendComputeCctp(
          amountToBeReceivedFloat,
          sourceChainToken,
          destinationChainToken,
          messenger
        );
    }
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
    return this.service.getGasFeeOptions(sourceChainToken, destinationChainToken, messenger);
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
    return this.service.getAverageTransferTime(sourceChainToken, destinationChainToken, messenger);
  }

  /**
   * Gets information about the poolInfo by token
   * @param token
   * @returns poolInfo
   */
  async getPoolInfoByToken(token: TokenWithChainDetails): Promise<PoolInfo> {
    return this.service.getPoolInfoByToken(token);
  }

  /**
   * Forces refresh of cached information about the state of liquidity pools.
   * Outdated cache leads to calculated amounts being less accurate.
   * The cache is invalidated at regular intervals, but it can be forced to be refreshed by calling this method.+
   *
   * @param tokens if present, the corresponding liquidity pools will be updated
   */
  async refreshPoolInfo(tokens?: TokenWithChainDetails | TokenWithChainDetails[]): Promise<void> {
    return this.service.refreshPoolInfo(tokens);
  }

  /**
   * Convert APR to percentage view
   * @param apr
   * @returns aprPercentageView
   */
  aprInPercents(apr: string): string {
    return this.service.aprInPercents(apr);
  }

  /**
   * Get possible limit of extra gas amount.
   * @param sourceChainToken selected token on the source chain
   * @param destinationChainToken selected token on the destination chain
   * @param messenger selected Messenger, Allbridge by default
   * @returns {@link ExtraGasMaxLimitResponse}
   */
  async getExtraGasMaxLimits(
    sourceChainToken: TokenWithChainDetails,
    destinationChainToken: TokenWithChainDetails,
    messenger: Messenger = Messenger.ALLBRIDGE
  ): Promise<ExtraGasMaxLimitResponse> {
    return this.service.getExtraGasMaxLimits(sourceChainToken, destinationChainToken, messenger);
  }

  /**
   * @param amount - amount
   * @param amountFormat - AmountFormat
   * @param sourceToken - selected token on the source chain
   * @return virtual amount
   */
  async getVUsdFromAmount(
    amount: string,
    amountFormat: AmountFormat,
    sourceToken: TokenWithChainDetails
  ): Promise<AmountFormatted> {
    return this.service.getVUsdFromAmount(amount, amountFormat, sourceToken);
  }

  /**
   * @param vUsdAmount - amount of vUsd, int format
   * @param destToken selected token on the destination chain
   * @return amount of destToken
   */
  async getAmountFromVUsd(vUsdAmount: string, destToken: TokenWithChainDetails): Promise<AmountFormatted> {
    return this.service.getAmountFromVUsd(vUsdAmount, destToken);
  }

  /**
   * @deprecated Use {@link getSendAmountDetails}
   * @param amountInTokenPrecision
   * @param sourceToken
   * @param destToken
   */
  async swapAndBridgeFeeCalculation(
    amountInTokenPrecision: string,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SwapAndBridgeCalculationData> {
    return this.service.swapAndBridgeFeeCalculation(amountInTokenPrecision, sourceToken, destToken);
  }

  /**
   * @deprecated Use {@link getAmountToBeReceived} and then {@link getSendAmountDetails}
   * @param amountInTokenPrecision
   * @param sourceToken
   * @param destToken
   */
  async swapAndBridgeFeeCalculationReverse(
    amountInTokenPrecision: string,
    sourceToken: TokenWithChainDetails,
    destToken: TokenWithChainDetails
  ): Promise<SwapAndBridgeCalculationData> {
    return this.service.swapAndBridgeFeeCalculationReverse(amountInTokenPrecision, sourceToken, destToken);
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
    return this.service.getSendAmountDetails(amount, amountFormat, sourceToken, destToken);
  }
}
