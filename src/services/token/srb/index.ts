import BN from "bn.js";
import erc20abi from "erc-20-abi";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import {ChainDecimalsByType, chainProperties, ChainSymbol, ChainType} from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { GetTokenBalanceParams, MethodNotSupportedError, TransactionResponse } from "../../../models";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction } from "../../models";
import { BaseContract } from "../../models/abi/types/types";
import { amountToHex } from "../../utils/index";
import { ApproveParamsDto, GetAllowanceParamsDto } from "../models";
import { ChainTokenService } from "../models/token";
import { NodeRpcUrlsConfig } from "../../index";
import { AllbridgeCoreSdkOptions } from "../../../index";
import {ClassOptions, TokenContract} from "../../models/srb/token-contract";
import {Horizon, Server as StellarServer} from "stellar-sdk";
import BalanceLineAsset = Horizon.BalanceLineAsset;
import BalanceLineNative = Horizon.BalanceLineNative;
import {convertFloatAmountToInt, convertIntAmountToFloat} from "../../../utils/calculation";

export class SrbTokenService extends ChainTokenService {
  chainType: ChainType.SRB = ChainType.SRB;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions,
    readonly api: AllbridgeCoreClient
  ) {
    super();
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    throw new MethodNotSupportedError("Soroban does not support yet");
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    const tokenContract = await this.getContract(TokenContract, params.token.tokenAddress);
    const tokenName = await tokenContract.name();
    const [symbol, srbTokenAddress] = tokenName.split(":");

    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const stellarAccount = await stellar.loadAccount(params.account);
    const balances = stellarAccount.balances;

    const balanceInfo = balances.find(
        (balance): balance is BalanceLineAsset =>
            (balance.asset_type === "credit_alphanum4" || balance.asset_type === "credit_alphanum12") &&
            balance.asset_code == symbol &&
            balance.asset_issuer == srbTokenAddress
    );
    if (balanceInfo?.balance) {
      return convertFloatAmountToInt(
          balanceInfo.balance,
          ChainDecimalsByType[chainProperties[params.token.chainSymbol].chainType]
      ).toFixed();
    }
    return "0"
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const stellarAccount = await stellar.loadAccount(params.account);
    const balances = stellarAccount.balances;

    const nativeBalance = balances.find(
      (balance): balance is BalanceLineNative =>
        (balance.asset_type === "native")
    );
    if (nativeBalance?.balance) {
      return convertFloatAmountToInt(
          nativeBalance.balance,
          ChainDecimalsByType[chainProperties[params.chainSymbol].chainType]
      ).toFixed();
    }
    return "0";
  }

  async approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    throw new MethodNotSupportedError("Soroban does not support yet");
  }

  async buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
    throw new MethodNotSupportedError("Soroban does not support yet");
  }

  private async getContract<T>(contract: new (args: ClassOptions) => T, address: string): Promise<T> {
    const config: ClassOptions = {
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new contract(config);
  }
}
