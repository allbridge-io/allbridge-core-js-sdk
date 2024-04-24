import Big from "big.js";
import { Address } from "soroban-client";
import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { MethodNotSupportedError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { FeePaymentMethod } from "../../../models";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction, TransactionResponse } from "../../models";
import { BridgeContract } from "../../models/srb/bridge";
import { ClassOptions } from "../../models/srb/method-options";
import { ChainBridgeService, SendParams, SwapParams, TxSendParams, TxSwapParams } from "../models";
import { getNonceBigInt, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class SrbBridgeService extends ChainBridgeService {
  chainType: ChainType.SRB = ChainType.SRB;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions,
    readonly api: AllbridgeCoreClient
  ) {
    super();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    return await this.buildRawTransactionSendFromParams(txSendParams);
  }

  async buildRawTransactionSendFromParams(params: TxSendParams): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toChainId,
      toAccountAddress,
      toTokenAddress,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = params;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }
    const contract = this.getContract(BridgeContract, contractAddress);
    let tx;
    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
      tx = await contract.swapAndBridge({
        sender: Address.fromString(fromAccountAddress),
        token: Address.contract(Buffer.from(fromTokenAddress)).toBuffer(),
        amount: BigInt(amount),
        recipient: Buffer.from(toAccountAddress),
        destination_chain_id: +toChainId,
        receive_token: Buffer.from(toTokenAddress),
        nonce: getNonceBigInt(),
        gas_amount: BigInt(0),
        fee_token_amount: BigInt(totalFee),
      });
    } else {
      tx = await contract.swapAndBridge({
        sender: Address.fromString(fromAccountAddress),
        token: Address.contract(Buffer.from(fromTokenAddress)).toBuffer(),
        amount: BigInt(amount),
        recipient: Buffer.from(toAccountAddress),
        destination_chain_id: +toChainId,
        receive_token: Buffer.from(toTokenAddress),
        nonce: getNonceBigInt(),
        gas_amount: BigInt(totalFee),
        fee_token_amount: BigInt(0),
      });
    }
    return tx;
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  async buildRawTransactionSwapFromParams(params: TxSwapParams): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toAccountAddress,
      toTokenAddress,
      minimumReceiveAmount,
    } = params;
    const contract = this.getContract(BridgeContract, contractAddress);
    return await contract.swap({
      sender: Address.fromString(fromAccountAddress),
      amount: BigInt(amount),
      token: Address.contract(Buffer.from(fromTokenAddress)).toBuffer(),
      receive_token: Buffer.from(toTokenAddress),
      recipient: Address.fromString(toAccountAddress as string),
      receive_amount_min: BigInt(minimumReceiveAmount),
      claimable: false,
    });
  }

  sendTx(): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  private getContract<T>(contract: new (args: ClassOptions) => T, address: string): T {
    const config: ClassOptions = {
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new contract(config);
  }
}
