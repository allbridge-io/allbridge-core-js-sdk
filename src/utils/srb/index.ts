import {
  Asset as StellarAsset,
  BASE_FEE,
  contract,
  Horizon,
  Operation,
  Operation as StellarOperation,
  rpc as SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  TransactionBuilder as StellarTransactionBuilder,
} from "@stellar/stellar-sdk";
import { ChainSymbol } from "../../chains/chain.enums";
import { AllbridgeCoreSdkOptions, SdkError } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { TokenContract } from "../../services/models/srb/token-contract";
import { withExponentialBackoff } from "../utils";
import ContractClientOptions = contract.ClientOptions;
import BalanceLineAsset = Horizon.HorizonApi.BalanceLineAsset;

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
  getBalanceLine(sender: string, tokenAddress: string): Promise<Horizon.HorizonApi.BalanceLineAsset | undefined>;

  /**
   * Submit tx
   * @param xdrTx
   */
  submitTransactionStellar(xdrTx: string): Promise<Horizon.HorizonApi.SubmitTransactionResponse>;

  /**
   * Simulate and check if Restore needed
   * @param xdrTx - restore
   * @param sourceAccount
   * @returns xdrTx restore transaction if it required after check
   */
  simulateAndCheckRestoreTxRequiredSoroban(xdrTx: string, sourceAccount: string): Promise<string | undefined>;

  /**
   * Submit tx
   * @param xdrTx
   */
  sendTransactionSoroban(xdrTx: string): Promise<SorobanRpc.Api.SendTransactionResponse>;

  /**
   * Confirm tx
   */
  confirmTx(hash: string, secondsToWait?: number): Promise<SorobanRpc.Api.GetTransactionResponse>;
}

export interface TrustLineParams {
  /**
   * Float amount of tokens, default is Number.MAX_SAFE_INTEGER
   */
  limit?: string;
  sender: string;
  tokenAddress: string;
}

const FEE = 100;
const SEND_TRANSACTION_TIMEOUT = 180;

export class DefaultSrbUtils implements SrbUtils {
  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions
  ) {}

  async buildChangeTrustLineXdrTx(params: TrustLineParams): Promise<string> {
    const stellar = new Horizon.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const stellarAccount = await stellar.loadAccount(params.sender);
    const tokenContract = this.getContract(TokenContract, params.tokenAddress);
    const tokenName = (await tokenContract.name()).result;
    const [symbol, srbTokenAddress] = tokenName.split(":");
    if (symbol === undefined || srbTokenAddress === undefined) {
      throw new SdkError(`Invalid token name format. Expected format 'symbol:srbTokenAddress'`);
    }
    const asset = new StellarAsset(symbol, srbTokenAddress);
    const changeTrust = StellarOperation.changeTrust({
      asset: asset,
      limit: params.limit,
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

  async getBalanceLine(sender: string, tokenAddress: string): Promise<Horizon.HorizonApi.BalanceLineAsset | undefined> {
    const tokenContract = this.getContract(TokenContract, tokenAddress);
    const tokenName = (await tokenContract.name()).result;
    const [symbol, srbTokenAddress] = tokenName.split(":");
    const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR);
    const stellar = new Horizon.Server(nodeRpcUrl);
    const stellarAccount = await stellar.loadAccount(sender);
    const balanceInfo = stellarAccount.balances;

    return balanceInfo.find(
      (balance): balance is BalanceLineAsset =>
        (balance.asset_type === "credit_alphanum4" || balance.asset_type === "credit_alphanum12") &&
        balance.asset_code == symbol &&
        balance.asset_issuer == srbTokenAddress
    );
  }

  async submitTransactionStellar(xdrTx: string): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const stellar = new Horizon.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR));
    const transaction = StellarTransactionBuilder.fromXDR(
      xdrTx,
      this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.STLR)
    );
    return await stellar.submitTransaction(transaction);
  }

  async simulateAndCheckRestoreTxRequiredSoroban(xdrTx: string, sourceAccount: string): Promise<string | undefined> {
    const server = new SorobanRpc.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    const account = await server.getAccount(sourceAccount);
    const transaction = TransactionBuilder.fromXDR(xdrTx, this.params.sorobanNetworkPassphrase) as Transaction;
    const simulation = await server.simulateTransaction(transaction);
    if (SorobanRpc.Api.isSimulationRestore(simulation)) {
      return new TransactionBuilder(account, {
        fee: (+BASE_FEE + +simulation.restorePreamble.minResourceFee).toString(),
        networkPassphrase: this.params.sorobanNetworkPassphrase,
      })
        .setSorobanData(simulation.restorePreamble.transactionData.build())
        .addOperation(Operation.restoreFootprint({}))
        .setTimeout(TimeoutInfinite)
        .build()
        .toXDR();
    }
    return undefined;
  }

  async sendTransactionSoroban(xdrTx: string): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const server = new SorobanRpc.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    const transaction = TransactionBuilder.fromXDR(xdrTx, this.params.sorobanNetworkPassphrase) as Transaction;
    return server.sendTransaction(transaction);
  }

  async confirmTx(hash: string, secondsToWait = 15): Promise<SorobanRpc.Api.GetTransactionResponse> {
    const server = new SorobanRpc.Server(this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB));
    const getTransactionResponseAll = await withExponentialBackoff(
      () => server.getTransaction(hash),
      (resp) => resp.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND,
      secondsToWait
    );

    if (getTransactionResponseAll.length === 0) {
      throw new SdkError("No transaction responses found.");
    }

    const lastResponse = getTransactionResponseAll[getTransactionResponseAll.length - 1];
    if (!lastResponse) {
      throw new SdkError("Unexpected error: last response is undefined.");
    }

    return lastResponse;
  }

  private getContract<T>(contract: new (args: ContractClientOptions) => T, address: string): T {
    const config: ContractClientOptions = {
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new contract(config);
  }
}
