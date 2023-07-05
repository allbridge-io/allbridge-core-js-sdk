import Web3 from "web3";
import { AllbridgeCoreClient } from "../../client/core-api";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { EvmBridgeService } from "./evm";
import { ApproveParams, CheckAllowanceParams, GetAllowanceParams, SendParams } from "./models";
import { ChainBridgeService } from "./models/bridge";
import { RawTransactionBuilder } from "./raw-transaction-builder";
import { SolanaBridgeParams, SolanaBridgeService } from "./sol";
import { TronBridgeService } from "./trx";

export class BridgeService {
  public rawTxBuilder: RawTransactionBuilder;

  constructor(
    private api: AllbridgeCoreClient,
    private solParams: SolanaBridgeParams,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new RawTransactionBuilder(api, solParams, this, tokenService);
  }

  /**
   * Get amount of tokens approved to be sent by the bridge
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns the amount of approved tokens
   */
  async getAllowance(provider: Provider, params: GetAllowanceParams): Promise<string> {
    return await this.tokenService.getAllowance(provider, { ...params, spender: params.token.bridgeAddress });
  }

  /**
   * Check if the amount of approved tokens is enough to make a transfer
   * @param provider
   * @param params See {@link GetAllowanceParams | GetAllowanceParams}
   * @returns true if the amount of approved tokens is enough to make a transfer
   */
  async checkAllowance(provider: Provider, params: CheckAllowanceParams): Promise<boolean> {
    return this.tokenService.checkAllowance(provider, { ...params, spender: params.token.bridgeAddress });
  }

  /**
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider
   * @param approveData
   */
  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    return this.tokenService.approve(provider, { ...approveData, spender: approveData.token.bridgeAddress });
  }

  /**
   * Send tokens through the ChainBridgeService
   * @param provider
   * @param params
   */
  async send(provider: Provider, params: SendParams): Promise<TransactionResponse> {
    return getChainBridgeService(this.api, this.solParams, provider).send(params);
  }
}

export function getChainBridgeService(
  api: AllbridgeCoreClient,
  solParams: SolanaBridgeParams,
  provider?: Provider
): ChainBridgeService {
  if (!provider) {
    return new SolanaBridgeService(solParams, api);
  }
  if (isTronWeb(provider)) {
    return new TronBridgeService(provider, api);
  } else {
    // Web3
    return new EvmBridgeService(provider as unknown as Web3, api);
  }
}

function isTronWeb(params: Provider): boolean {
  // @ts-expect-error get existing trx property
  return (params as TronWeb).trx !== undefined;
}
