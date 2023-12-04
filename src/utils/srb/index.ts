import * as SorobanClient from "soroban-client";
import {SorobanRpc, Transaction, TransactionBuilder} from "soroban-client";
import {
  Asset as StellarAsset,
  Horizon,
  Operation as StellarOperation,
  Server as StellarServer,
  TransactionBuilder as StellarTransactionBuilder,
} from "stellar-sdk";
import {AllbridgeCoreSdkOptions, ChainSymbol} from "../../index";
import {NodeRpcUrlsConfig} from "../../services";
import {ClassOptions} from "../../services/models/srb/method-options";
import {TokenContract} from "../../services/models/srb/token-contract";
import {sendTx} from "../../services/models/srb/tx-builder";
import BalanceLineAsset = Horizon.BalanceLineAsset;

/**
 * Contains usefully Soroban methods
 */
export interface SrbUtils {
  /**
   * Build change Trust line Tx
   * @param params see {@link TrustLineParams}
   * @returns xdr Tx
   */
  buildChangeTrustLineXdrTx(params: TrustLineParams): Promise<string>;

  /**
   * Get Balance Line information if exists
   * @param sender
   * @param tokenAddress
   */
  getBalanceLine(sender: string, tokenAddress: string): Promise<Horizon.BalanceLine | undefined>;

  /**
   * Submit tx
   * @param xdrTx
   */
  submitXdrTransactionStellar(xdrTx: string): Promise<Horizon.SubmitTransactionResponse>;

  /**
   * Submit tx
   * @param xdrTx
   */
  submitXdrTransactionSoroban(xdrTx: string): Promise<SorobanRpc.SendTransactionResponse | SorobanRpc.GetSuccessfulTransactionResponse | SorobanRpc.GetFailedTransactionResponse | SorobanRpc.GetMissingTransactionResponse>;
}

export interface TrustLineParams {
  /**
   * Float amount of tokens, default {@link Number.MAX_SAFE_INTEGER}
   */
  limit?: string;
  sender: string;
  tokenAddress: string;
}

const FEE = 100;
const SEND_TRANSACTION_TIMEOUT = 180;

export class DefaultSrbUtils implements SrbUtils {
  constructor(readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig, readonly params: AllbridgeCoreSdkOptions) {
  }

  async buildChangeTrustLineXdrTx(params: TrustLineParams): Promise<string> {
    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const stellarAccount = await stellar.loadAccount(params.sender);
    const tokenContract = await this.getContract(TokenContract, params.tokenAddress);
    const tokenName = await tokenContract.name();
    const [symbol, srbTokenAddress] = tokenName.split(":");

    const asset = new StellarAsset(symbol, srbTokenAddress);
    const changeTrust = StellarOperation.changeTrust({
      asset: asset,
      limit: params.limit ? params.limit : Number.MAX_SAFE_INTEGER.toString(),
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

  async getBalanceLine(sender: string, tokenAddress: string): Promise<Horizon.BalanceLine | undefined> {
    const tokenContract = await this.getContract(TokenContract, tokenAddress);
    const tokenName = await tokenContract.name();
    const [symbol, srbTokenAddress] = tokenName.split(":");

    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const stellarAccount = await stellar.loadAccount(sender);
    const balanceInfo = stellarAccount.balances;

    return balanceInfo.find(
      (balance): balance is BalanceLineAsset =>
        (balance.asset_type === "credit_alphanum4" || balance.asset_type === "credit_alphanum12") &&
        balance.asset_code == symbol &&
        balance.asset_issuer == srbTokenAddress
    );
  }

  async submitXdrTransactionStellar(xdrTx: string): Promise<Horizon.SubmitTransactionResponse> {
    const stellar = new StellarServer(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const transaction = StellarTransactionBuilder.fromXDR(xdrTx, this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    return await stellar.submitTransaction(transaction);
  }

  async submitXdrTransactionSoroban(xdrTx: string): Promise<SorobanRpc.SendTransactionResponse | SorobanRpc.GetSuccessfulTransactionResponse | SorobanRpc.GetFailedTransactionResponse | SorobanRpc.GetMissingTransactionResponse> {
    const server = new SorobanClient.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    const transaction = TransactionBuilder.fromXDR(xdrTx, this.params.sorobanNetworkPassphrase) as Transaction;
    const secondsToWait = 10;
    return await sendTx(transaction, secondsToWait, server);
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
