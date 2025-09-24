import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { Algodv2 } from "algosdk";
import { TronWeb } from "tronweb";
import { Web3 } from "web3";
import { NodeRpcUrlsConfig } from "..";
import { Chains } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import { CCTPDoesNotSupportedError, OFTDoesNotSupportedError } from "../../exceptions";
import { AllbridgeCoreSdkOptions, ChainSymbol, ChainType, EssentialWeb3 } from "../../index";
import { TokenWithChainDetails } from "../../tokens-info";
import { validateAmountDecimals, validateAmountGtZero } from "../../utils/utils";
import { Provider, TransactionResponse } from "../models";
import { TokenService } from "../token";
import { AlgBridgeService } from "./alg";
import { EvmBridgeService } from "./evm";
import { ApproveParams, ChainBridgeService, CheckAllowanceParams, GetAllowanceParams, SendParams } from "./models";
import { DefaultRawBridgeTransactionBuilder, RawBridgeTransactionBuilder } from "./raw-bridge-transaction-builder";
import { SolanaBridgeService } from "./sol";
import { SrbBridgeService } from "./srb";
import { SuiBridgeService } from "./sui";
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
   * @deprecated Use {@link rawTxBuilder}.{@link RawBridgeTransactionBuilder.approve}<p>
   * Approve tokens usage by another address on chains
   * <p>
   * For ETH/USDT: due to specificity of the USDT contract:<br/>
   * If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.
   * @param provider - will be used to access the network
   * @param approveData
   */
  approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse>;

  /**
   * @deprecated Use {@link rawTxBuilder}.{@link RawBridgeTransactionBuilder.send}<p>
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
    private params: AllbridgeCoreSdkOptions,
    private tokenService: TokenService
  ) {
    this.rawTxBuilder = new DefaultRawBridgeTransactionBuilder(api, nodeRpcUrlsConfig, params, tokenService);
  }

  async getAllowance(a: Provider | GetAllowanceParams, b?: GetAllowanceParams): Promise<string> {
    let provider: Provider | undefined;
    let params: GetAllowanceParams;
    if (b) {
      provider = a as Provider;
      params = b;
    } else {
      params = a as GetAllowanceParams;
    }
    const spender = getSpender(params.token, params.messenger);
    return await this.tokenService.getAllowance({ ...params, spender }, provider);
  }

  async checkAllowance(a: Provider | CheckAllowanceParams, b?: CheckAllowanceParams): Promise<boolean> {
    let provider: Provider | undefined;
    let params: CheckAllowanceParams;
    if (b) {
      provider = a as Provider;
      params = b;
    } else {
      params = a as CheckAllowanceParams;
    }
    const spender = getSpender(params.token, params.messenger);
    return this.tokenService.checkAllowance({ ...params, spender }, provider);
  }

  async approve(provider: Provider, approveData: ApproveParams): Promise<TransactionResponse> {
    const spender = getSpender(approveData.token, approveData.messenger);
    return this.tokenService.approve(provider, { ...approveData, spender });
  }

  async send(provider: Provider, params: SendParams): Promise<TransactionResponse> {
    validateAmountGtZero(params.amount);
    validateAmountDecimals("amount", params.amount, params.sourceToken.decimals);
    return getChainBridgeService(
      params.sourceToken.chainSymbol,
      this.api,
      this.nodeRpcUrlsConfig,
      this.params,
      provider
    ).send(params);
  }
}

export function getSpender(token: TokenWithChainDetails, messenger: Messenger = Messenger.ALLBRIDGE): string {
  switch (messenger) {
    case Messenger.CCTP:
      if (token.cctpAddress) {
        return token.cctpAddress;
      } else {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
      }
    case Messenger.CCTP_V2:
      if (token.cctpV2Address) {
        return token.cctpV2Address;
      } else {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP V2 protocol");
      }
    case Messenger.OFT:
      if (token.oftBridgeAddress) {
        return token.oftBridgeAddress;
      } else {
        throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
      }
    case Messenger.ALLBRIDGE:
    case Messenger.WORMHOLE:
      return token.bridgeAddress;
  }
}

export function getChainBridgeService(
  chainSymbol: string,
  api: AllbridgeCoreClient,
  nodeRpcUrlsConfig: NodeRpcUrlsConfig,
  params: AllbridgeCoreSdkOptions,
  provider?: Provider
): ChainBridgeService {
  switch (Chains.getChainProperty(chainSymbol).chainType) {
    case ChainType.EVM: {
      if (provider) {
        return new EvmBridgeService(provider as EssentialWeb3, api, nodeRpcUrlsConfig);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new EvmBridgeService(new Web3(nodeRpcUrl), api, nodeRpcUrlsConfig);
      }
    }
    case ChainType.TRX: {
      if (provider) {
        return new TronBridgeService(provider as TronWeb, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        return new TronBridgeService(
          new TronWeb({
            fullHost: nodeRpcUrl,
            solidityNode: nodeRpcUrl,
            eventServer: nodeRpcUrl,
          }),
          api
        );
      }
    }
    case ChainType.SOLANA: {
      return new SolanaBridgeService(
        nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL),
        {
          wormholeMessengerProgramId: params.wormholeMessengerProgramId,
          solanaLookUpTable: params.solanaLookUpTable,
          cctpParams: params.cctpParams,
          jupiterParams: {
            jupiterUrl: params.jupiterUrl,
            jupiterApiKeyHeader: params.jupiterApiKeyHeader,
            jupiterMaxAccounts: params.jupiterMaxAccounts,
          },
        },
        api
      );
    }
    case ChainType.SRB: {
      return new SrbBridgeService(nodeRpcUrlsConfig, params, api);
    }
    case ChainType.SUI: {
      return new SuiBridgeService(nodeRpcUrlsConfig, api);
    }
    case ChainType.ALG: {
      if (provider) {
        const algod = provider as Algodv2;
        const algorand = AlgorandClient.fromClients({ algod });
        return new AlgBridgeService(algorand, api);
      } else {
        const nodeRpcUrl = nodeRpcUrlsConfig.getNodeRpcUrl(chainSymbol);
        const algorand = AlgorandClient.fromConfig({
          algodConfig: { server: nodeRpcUrl },
        });
        return new AlgBridgeService(algorand, api);
      }
    }
  }
}
