import { Account, Address, Asset, Operation, TimeoutInfinite, TransactionBuilder } from "soroban-client";
import {
  Horizon,
  Server as StellarServer,
  Asset as StellarAsset,
  Operation as StellarOperation,
  TransactionBuilder as StellarTransactionBuilder,
} from "stellar-sdk";
// import * as Stellar from "stellar-sdk";
import { AllbridgeCoreSdkOptions, ChainSymbol } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { ClassOptions } from "../../services/models/srb/method-options";
import { TokenContract } from "../../services/models/srb/token-contract";
import BalanceLineAsset = Horizon.BalanceLineAsset;

/**
 * Contains usefully Soroban methods
 */
export interface SrbUtils {
  buildChangeTrustTx(limit: string, sender: string, tokenAddress: string): Promise<string>;

  getTrustLine(sender: string, tokenAddress: string): Promise<Horizon.BalanceLine | undefined>;
}

const FEE = 100;
const SEND_TRANSACTION_TIMEOUT = 180;

export class DefaultSrbUtils implements SrbUtils {
  constructor(readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig, readonly params: AllbridgeCoreSdkOptions) {}

  async buildChangeTrustTx(limit: string, sender: string, tokenAddress: string): Promise<string> {
    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB_STLR));
    const stellarAccount = await stellar.loadAccount(sender);
    // stellarAccount.in
    // console./
    const tokenContract = await this.getContract(TokenContract, tokenAddress);
    const tokenName = await tokenContract.name();
    const [symbol, srbTokenAddress] = tokenName.split(":");

    const asset = new StellarAsset(symbol, srbTokenAddress);
    const changeTrust = StellarOperation.changeTrust({
      asset: asset,
      limit: limit,
    });

    return new StellarTransactionBuilder(stellarAccount, {
      fee: FEE.toString(10),
      networkPassphrase: this.params.sorobanNetworkPassphrase,
    })
      .addOperation(changeTrust)
      .setTimeout(SEND_TRANSACTION_TIMEOUT)
      .build()
      .toXDR();
  }

  async getTrustLine(sender: string, tokenAddress: string): Promise<Horizon.BalanceLine | undefined> {
    const tokenContract = await this.getContract(TokenContract, tokenAddress);
    const tokenName = await tokenContract.name();
    const [symbol, srbTokenAddress] = tokenName.split(":");

    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB_STLR));
    const stellarAccount = await stellar.loadAccount(sender);
    const balanceInfo = stellarAccount.balances;

    return balanceInfo.find(
      (balance): balance is BalanceLineAsset =>
        (balance.asset_type === "credit_alphanum4" || balance.asset_type === "credit_alphanum12") &&
        balance.asset_code == symbol &&
        balance.asset_issuer == srbTokenAddress
    );
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