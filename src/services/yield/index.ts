import { TronWeb } from "tronweb";
import { FMT_BYTES, FMT_NUMBER, Web3 } from "web3";
import { Chains } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { AllbridgeCoreClientFiltered } from "../../client/core-api/core-client-filtered";
import { MethodNotSupportedError } from "../../exceptions";
import { AllbridgeCoreSdkOptions, ChainType, EssentialWeb3, TokenWithChainDetails } from "../../index";
import { convertIntAmountToFloat } from "../../utils/calculation";
import { SYSTEM_PRECISION } from "../../utils/calculation/constants";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { NodeRpcUrlsConfig } from "../index";
import { Provider } from "../models";
import { TokenService } from "../token";
import { EvmYieldService } from "./evm";
import {
  ChainYieldService,
  CYDToken,
  TokenWithChainDetailsYield,
  YieldBalanceParams,
  YieldCheckAllowanceParams,
  YieldGetAllowanceParams,
  YieldGetEstimatedAmountOnDepositParams,
  YieldGetWithdrawProportionAmountParams,
  YieldWithdrawAmount,
} from "./models";
import { DefaultRawYieldTransactionBuilder, RawYieldTransactionBuilder } from "./raw-yield-transaction-builder";
import { TronYieldService } from "./trx";
import { isYieldSupported } from "./validations";

export interface YieldService {
  rawTxBuilder: RawYieldTransactionBuilder;

  /**
   * Returns a list of supported {@link CYDToken}.
   */
  getCYDTokens(): Promise<CYDToken[]>;

  /**
   * Get amount of tokens approved for Yield
   * @param provider - will be used to access the network
   * @param params See {@link YieldGetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(params: YieldGetAllowanceParams, provider?: Provider): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough
   * @param params See {@link YieldCheckAllowanceParams}
   * @param provider - will be used to access the network
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(params: YieldCheckAllowanceParams, provider?: Provider): Promise<boolean>;

  /**
   * Get token balance
   * @param params
   * @param provider
   * @returns Token balance
   */
  balanceOf(params: YieldBalanceParams, provider?: Provider): Promise<string>;

  /**
   * Calculates the amount of CYD tokens that will be deposited
   * @param params - will be used to access the network
   * @param provider - will be used to access the network
   * @returns amount
   */
  getEstimatedAmountOnDeposit(params: YieldGetEstimatedAmountOnDepositParams, provider?: Provider): Promise<string>;

  /**
   * Calculates the amounts of tokens ({@link YieldWithdrawAmount}) will be withdrawn
   * @param params
   * @param provider - will be used to access the network
   * @returns amounts
   */
  getWithdrawAmounts(
    params: YieldGetWithdrawProportionAmountParams,
    provider?: Provider
  ): Promise<YieldWithdrawAmount[]>;
}

export class DefaultYieldService implements YieldService {
  public rawTxBuilder: RawYieldTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClientFiltered,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private params: AllbridgeCoreSdkOptions,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new DefaultRawYieldTransactionBuilder(api, nodeRpcUrlsConfig, params, tokenService);
  }

  async getCYDTokens(): Promise<CYDToken[]> {
    const result: CYDToken[] = [];
    const chainMap = await this.api.getChainDetailsMap("pool");

    Object.values(chainMap).forEach((chainData) => {
      if (chainData.yieldAddress) {
        const cydToken = chainData.tokens.find((t) => t.tokenAddress === chainData.yieldAddress);
        const tokens: TokenWithChainDetailsYield[] = chainData.tokens.filter(isYieldSupported);
        if (tokens.length > 0) {
          const cydDefined: TokenWithChainDetails = cydToken ?? {
            allbridgeChainId: chainData.allbridgeChainId,
            apr: "",
            apr30d: "",
            apr7d: "",
            bridgeId: chainData.bridgeId,
            bridgeAddress: chainData.bridgeAddress,
            chainId: chainData.chainId,
            chainName: chainData.name,
            chainSymbol: chainData.chainSymbol,
            chainType: chainData.chainType,
            confirmations: chainData.confirmations,
            decimals: 3,
            feeShare: "",
            lpRate: "",
            name: "Core Yield",
            poolAddress: "",
            symbol: "CYD",
            tokenAddress: chainData.yieldAddress,
            transferTime: {},
            txCostAmount: { maxAmount: "0", swap: "0", transfer: "0" },
            yieldAddress: chainData.yieldAddress,
          };
          result.push({
            ...cydDefined,
            yieldAddress: chainData.yieldAddress,
            tokens: tokens,
          });
        }
      }
    });

    return result;
  }

  async getAllowance(params: YieldGetAllowanceParams, provider?: Provider): Promise<string> {
    return await this.tokenService.getAllowance({ ...params, spender: params.token.yieldAddress }, provider);
  }

  async checkAllowance(params: YieldCheckAllowanceParams, provider?: Provider): Promise<boolean> {
    return this.tokenService.checkAllowance({ ...params, spender: params.token.yieldAddress }, provider);
  }

  async balanceOf(params: YieldBalanceParams, provider?: Provider): Promise<string> {
    return getChainYieldService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      params.owner,
      provider
    ).balanceOf(params);
  }

  async getEstimatedAmountOnDeposit(
    params: YieldGetEstimatedAmountOnDepositParams,
    provider?: Provider
  ): Promise<string> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.token.decimals);
    return getChainYieldService(
      params.token.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      params.token.yieldAddress,
      provider
    ).getEstimatedAmountOnDeposit(params);
  }

  async getWithdrawAmounts(
    params: YieldGetWithdrawProportionAmountParams,
    provider?: Provider
  ): Promise<YieldWithdrawAmount[]> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, SYSTEM_PRECISION);
    const proportionAmounts = await getChainYieldService(
      params.cydToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      params.owner,
      provider
    ).getWithdrawProportionAmount(params);
    return params.cydToken.tokens
      .filter((token) => proportionAmounts[token.yieldId] !== undefined)
      .map((token) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        amount: convertIntAmountToFloat(proportionAmounts[token.yieldId]!, token.decimals).toFixed(),
        token: token,
      }));
  }
}

export function getChainYieldService(
  chainSymbol: string,
  api: AllbridgeCoreClient,
  nodeRpcUrlsConfig: NodeRpcUrlsConfig,
  ownerAddress: string,
  provider?: Provider
): ChainYieldService {
  switch (Chains.getChainProperty(chainSymbol).chainType) {
    case ChainType.EVM: {
      if (provider) {
        return new EvmYieldService(provider as EssentialWeb3, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        const web3 = new Web3(nodeRpcUrl);
        web3.defaultReturnFormat = { number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX };
        return new EvmYieldService(web3, api);
      }
    }
    case ChainType.TRX: {
      if (provider) {
        return new TronYieldService(provider as TronWeb, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        const tronWeb = new TronWeb({ fullHost: nodeRpcUrl });
        tronWeb.setAddress(ownerAddress);
        return new TronYieldService(tronWeb, api);
      }
    }
    case ChainType.SOLANA: {
      throw new MethodNotSupportedError();
    }
    case ChainType.SRB: {
      throw new MethodNotSupportedError();
    }
    case ChainType.SUI: {
      throw new MethodNotSupportedError();
    }
    case ChainType.ALG: {
      throw new MethodNotSupportedError();
    }
    case ChainType.STX: {
      throw new MethodNotSupportedError();
    }
  }
}
