import { Big } from "big.js";
// @ts-expect-error import tron
import TronWeb from "tronweb";
import Web3 from "web3";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { NodeRpcUrlsConfig } from "../../index";
import { validateAmountDecimals } from "../../utils";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { EvmBridgeService } from "./evm";
import { ApproveParams, CheckAllowanceParams, GetAllowanceParams, SendParams } from "./models";
import { ChainBridgeService } from "./models/bridge";
import { DefaultRawBridgeTransactionBuilder, RawBridgeTransactionBuilder } from "./raw-bridge-transaction-builder";
import { SolanaBridgeParams, SolanaBridgeService } from "./sol";
import { TronBridgeService } from "./trx";

export interface BridgeService {
  rawTxBuilder: RawBridgeTransactionBuilder;

  /**
   * Get amount of tokens approved to be sent by the bridge
   * @param provider - will be used to access the network
   * @param params See {@link GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string>;

  /**
   * Get amount of tokens approved to be sent by the bridge
   * @param params See {@link GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(params: GetAllowanceParams): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider - will be used to access the network
   * @param params See {@link CheckAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param params See {@link CheckAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider - will be used to access the network
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  /**
   * Send tokens through the ChainBridgeService
   * @param provider - will be used to access the network
   * @param params
   */
  send(provider: Provider, params: SendParams): Promise<TransactionResponse>;
}

export class DefaultBridgeService implements BridgeService {
  public rawTxBuilder: RawBridgeTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    private solParams: SolanaBridgeParams,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new DefaultRawBridgeTransactionBuilder(api, nodeRpcUrlsConfig, solParams, this, tokenService);
  }

  async getAllowance(a: Provider | GetAllowanceParams, b?: GetAllowanceParams): Promise<string> {
    if (b) {
      const provider = a as Provider;
      const params = b;
      return await this.tokenService.getAllowance({ ...params, spender: params.token.bridgeAddress }, provider);
    } else {
      const params = a as GetAllowanceParams;
      return await this.tokenService.getAllowance({ ...params, spender: params.token.bridgeAddress });
    }
  }

  async checkAllowance(a: Provider | CheckAllowanceParams, b?: CheckAllowanceParams): Promise<boolean> {
    if (b) {
      const provider = a as Provider;
      const params = b;
      return this.tokenService.checkAllowance({ ...params, spender: params.token.bridgeAddress }, provider);
    } else {
      const params = a as CheckAllowanceParams;
      return this.tokenService.checkAllowance({ ...params, spender: params.token.bridgeAddress });
    }
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.tokenService.approve(provider, { ...approveData, spender: approveData.token.bridgeAddress });
  }

  async send(provider: Provider, params: SendParams): Promise<TransactionResponse> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.sourceToken.decimals);
    return getChainBridgeService(
      params.sourceToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.solParams,
      provider
    ).send(params);
  }
}

export function getChainBridgeService(
  chainSymbol: ChainSymbol,
  api: AllbridgeCoreClient,
  nodeRpcUrlsConfig: NodeRpcUrlsConfig,
  solParams: SolanaBridgeParams,
  provider?: Provider
): ChainBridgeService {
  switch (chainProperties[chainSymbol].chainType) {
    case ChainType.EVM: {
      if (provider) {
        return new EvmBridgeService(provider as unknown as Web3, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new EvmBridgeService(new Web3(nodeRpcUrl), api);
      }
    }
    case ChainType.TRX: {
      if (provider) {
        return new TronBridgeService(provider, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new TronBridgeService(new TronWeb({ fullHost: nodeRpcUrl }), api);
      }
    }
    case ChainType.SOLANA: {
      return new SolanaBridgeService(nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL), solParams, api);
    }
  }
}
