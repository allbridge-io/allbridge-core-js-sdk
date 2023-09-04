import { Big } from "big.js";
import Web3 from "web3";
import { ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
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
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string>;

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean>;

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  /**
   * Send tokens through the ChainBridgeService
   * @param provider
   * @param params
   */
  send(provider: Provider, params: SendParams): Promise<TransactionResponse>;
}

export class DefaultBridgeService implements BridgeService {
  public rawTxBuilder: RawBridgeTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaBridgeParams,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new DefaultRawBridgeTransactionBuilder(api, solParams, this, tokenService);
  }

  async getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string> {
    return await this.tokenService.getAllowance(provider, { ...params, spender: params.token.bridgeAddress });
  }

  async checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean> {
    return this.tokenService.checkAllowance(provider, { ...params, spender: params.token.bridgeAddress });
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.tokenService.approve(provider, { ...approveData, spender: approveData.token.bridgeAddress });
  }

  async send(provider: Provider, params: SendParams): Promise<TransactionResponse> {
    validateAmountDecimals("amount", Big(params.amount).toString(), params.sourceToken.decimals);
    return getChainBridgeService(params.sourceToken.chainType, this.api, this.solParams, provider).send(params);
  }
}

export function getChainBridgeService(
  chainType: ChainType,
  api: AllbridgeCoreClient,
  solParams: SolanaBridgeParams,
  provider?: Provider
): ChainBridgeService {
  switch (chainType) {
    case ChainType.EVM:
      return new EvmBridgeService(provider as unknown as Web3, api);
    case ChainType.TRX:
      return new TronBridgeService(provider, api);
    case ChainType.SOLANA:
      return new SolanaBridgeService(solParams, api);
  }
}
