import { Big } from "big.js";
import { ChainSymbol } from "./chains";
import { AllbridgeCoreClientImpl } from "./client/core-api";
import { AllbridgeCachingCoreClient } from "./client/core-api/caching-core-client";
import { TransferStatusResponse } from "./client/core-api/core-api.model";
import { production } from "./configs";
import { InsufficientPoolLiquidity } from "./exceptions";
import { AmountsAndTxCost, Messenger, PoolInfo } from "./models";
import { RawTransactionBuilder } from "./raw-transaction-builder";
import { BridgeService } from "./services/bridge";
import {
  ApproveData,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenAddress,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
} from "./services/bridge/models";
import { SolanaBridgeParams } from "./services/bridge/sol";
import { LiquidityPoolService } from "./services/liquidity-pool";
import { UserBalanceInfo } from "./services/liquidity-pool/models";
import { SolanaPoolParams } from "./services/liquidity-pool/sol";
import { Provider } from "./services/models";
import {
  ChainDetailsMap,
  TokenInfoWithChainDetails,
  TokensInfo,
} from "./tokens-info";
import {
  aprInPercents,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  getPoolInfoByTokenInfo,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
} from "./utils/calculation";

export * from "./configs/production";
export * from "./models";
export {
  TokensInfo,
  ChainDetailsMap,
  ChainDetailsWithTokens,
} from "./tokens-info";

export interface AllbridgeCoreSdkOptions {
  apiUrl: string;
  solanaRpcUrl: string;
  polygonApiUrl: string;

  wormholeMessengerProgramId: string;
}

export class AllbridgeCoreSdk {
  /**
   * @internal
   */
  private readonly api: AllbridgeCachingCoreClient;
  /**
   * @internal
   */
  private bridgeService: BridgeService;
  private liquidityPoolService: LiquidityPoolService;

  readonly params: AllbridgeCoreSdkOptions;

  rawTransactionBuilder: RawTransactionBuilder;

  /**
   * Initializes the SDK object.
   * @param params Preset parameters can be used. See {@link production | production preset}
   */
  constructor(params: AllbridgeCoreSdkOptions = production) {
    const apiClient = new AllbridgeCoreClientImpl({
      apiUrl: params.apiUrl,
      polygonApiUrl: params.polygonApiUrl,
    });
    const solBridgeParams: SolanaBridgeParams = {
      solanaRpcUrl: params.solanaRpcUrl,
      wormholeMessengerProgramId: params.wormholeMessengerProgramId,
    };
    this.api = new AllbridgeCachingCoreClient(apiClient);
    const bridgeService = new BridgeService(this.api, solBridgeParams);
    this.bridgeService = bridgeService;
    const solPoolParams: SolanaPoolParams = {
      solanaRpcUrl: params.solanaRpcUrl,
    };
    const liquidityPoolService = new LiquidityPoolService(
      this.api,
      solPoolParams
    );
    this.liquidityPoolService = liquidityPoolService;
    this.rawTransactionBuilder = new RawTransactionBuilder(
      bridgeService,
      liquidityPoolService
    );
    this.params = params;
  }

  /**
   * @deprecated Use one of the following methods instead: chainDetailsMap, tokens, tokensByChain.
   * Fetches information about the supported tokens from the Allbridge Core API.
   */
  async getTokensInfo(): Promise<TokensInfo> {
    return new TokensInfo(await this.api.getChainDetailsMap());
  }

  /**
   * Returns {@link ChainDetailsMap} containing a list of supported tokens groped by chain.
   */
  async chainDetailsMap(): Promise<ChainDetailsMap> {
    return this.api.getChainDetailsMap();
  }

  /**
   * Returns a list of supported {@link TokenInfoWithChainDetails | tokens}.
   */
  async tokens(): Promise<TokenInfoWithChainDetails[]> {
    const map = await this.api.getChainDetailsMap();
    return Object.values(map).flatMap((chainDetails) => chainDetails.tokens);
  }

  /**
   * Returns a list of supported {@link TokenInfoWithChainDetails | tokens} on the selected chain.
   */
  async tokensByChain(
    chainSymbol: ChainSymbol
  ): Promise<TokenInfoWithChainDetails[]> {
    const map = await this.api.getChainDetailsMap();
    return map[chainSymbol].tokens;
  }

  /**
   * Get amount of tokens approved to be sent by the bridge
   * @param provider
   * @param params See {@link GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenAddress} and {@link GetAllowanceParamsWithTokenInfo | GetAllowanceParamsWithTokenInfo}
   * @returns the amount of approved tokens
   */
  async getAllowance(
    provider: Provider,
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<string> {
    return await this.bridgeService.getAllowance(provider, params);
  }

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenAddress} and {@link GetAllowanceParamsWithTokenInfo | GetAllowanceParamsWithTokenInfo}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  async checkAllowance(
    provider: Provider,
    params:
      | CheckAllowanceParamsWithTokenAddress
      | CheckAllowanceParamsWithTokenInfo
  ): Promise<boolean> {
    return await this.bridgeService.checkAllowance(provider, params);
  }

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
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
   * Get token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  async getTokenBalance(
    params:
      | GetTokenBalanceParamsWithTokenAddress
      | GetTokenBalanceParamsWithTokenInfo,
    provider?: Provider
  ): Promise<string> {
    return this.bridgeService.getTokenBalance(params, provider);
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
   * Fetches information about tokens transfer by chosen chainSymbol and transaction Id from the Allbridge Core API.
   * @param chainSymbol
   * @param txId
   */
  async getTransferStatus(
    chainSymbol: ChainSymbol,
    txId: string
  ): Promise<TransferStatusResponse> {
    return this.api.getTransferStatus(chainSymbol, txId);
  }

  /**
   * Calculates the percentage of fee from the initial amount that is charged when swapping from the selected source chain.
   * @param amountFloat initial amount of tokens to swap
   * @param sourceChainToken selected token on the source chain
   * @returns fee percent
   */
  async calculateFeePercentOnSourceChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails
  ): Promise<number> {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(
      amountInt,
      sourceChainToken,
      await getPoolInfoByTokenInfo(this.api, sourceChainToken)
    );
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
  async calculateFeePercentOnDestinationChain(
    amountFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails
  ): Promise<number> {
    const amountInt = convertFloatAmountToInt(
      amountFloat,
      sourceChainToken.decimals
    );
    if (amountInt.eq(0)) {
      return 0;
    }
    const vUsdInSystemPrecision = swapToVUsd(
      amountInt,
      sourceChainToken,
      await getPoolInfoByTokenInfo(this.api, sourceChainToken)
    );
    const usd = swapFromVUsd(
      vUsdInSystemPrecision,
      destinationChainToken,
      await getPoolInfoByTokenInfo(this.api, destinationChainToken)
    );
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
      amountToBeReceivedFloat: await this.getAmountToBeReceived(
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
      amountToSendFloat: await this.getAmountToSend(
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
  async getAmountToBeReceived(
    amountToSendFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails
  ): Promise<string> {
    const amountToSend = convertFloatAmountToInt(
      amountToSendFloat,
      sourceChainToken.decimals
    );

    const vUsd = swapToVUsd(
      amountToSend,
      sourceChainToken,
      await getPoolInfoByTokenInfo(this.api, sourceChainToken)
    );
    const resultInt = swapFromVUsd(
      vUsd,
      destinationChainToken,
      await getPoolInfoByTokenInfo(this.api, destinationChainToken)
    );
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
  async getAmountToSend(
    amountToBeReceivedFloat: number | string | Big,
    sourceChainToken: TokenInfoWithChainDetails,
    destinationChainToken: TokenInfoWithChainDetails
  ): Promise<string> {
    const amountToBeReceived = convertFloatAmountToInt(
      amountToBeReceivedFloat,
      destinationChainToken.decimals
    );

    const vUsd = swapFromVUsdReverse(
      amountToBeReceived,
      destinationChainToken,
      await getPoolInfoByTokenInfo(this.api, destinationChainToken)
    );
    const resultInt = swapToVUsdReverse(
      vUsd,
      sourceChainToken,
      await getPoolInfoByTokenInfo(this.api, sourceChainToken)
    );
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
    return (
      /* eslint-disable-next-line  @typescript-eslint/no-unnecessary-condition */
      sourceChainToken.transferTime?.[
        destinationChainToken.chainSymbol as ChainSymbol
      ]?.[messenger] ?? null
    );
  }

  /**
   * Forces refresh of cached information about the state of liquidity pools.
   */
  async refreshPoolInfo(): Promise<void> {
    return this.api.refreshPoolInfo();
  }

  /**
   * Get User Balance Info on Liquidity pool
   * @param accountAddress
   * @param token
   * @param provider
   * @returns UserBalanceInfo
   */
  async getLiquidityBalanceInfo(
    accountAddress: string,
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<UserBalanceInfo> {
    return this.liquidityPoolService.getUserBalanceInfo(
      accountAddress,
      token,
      provider
    );
  }

  /**
   * Calculates the amount of LP tokens that will be deposited
   * @param amount The float amount of tokens that will be sent
   * @param token
   * @param provider
   * @returns amount
   */
  async getLPAmountOnDeposit(
    amount: string,
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<string> {
    return this.liquidityPoolService.getAmountToBeDeposited(
      amount,
      token,
      provider
    );
  }

  /**
   * Calculates the amount of tokens will be withdrawn
   * @param amount The float amount of tokens that will be sent
   * @param accountAddress
   * @param token
   * @param provider
   * @returns amount
   */
  async getAmountToBeWithdrawn(
    amount: string,
    accountAddress: string,
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<string> {
    return this.liquidityPoolService.getAmountToBeWithdrawn(
      amount,
      accountAddress,
      token,
      provider
    );
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
   * Gets information about the pool by token
   * @param token
   * @param provider
   * @returns poolInfo
   */
  getPoolInfo(
    token: TokenInfoWithChainDetails,
    provider?: Provider
  ): Promise<PoolInfo> {
    return this.liquidityPoolService.getPoolInfo(token, provider);
  }
}
