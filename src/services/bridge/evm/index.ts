import Big from "big.js";
import BN from "bn.js";
import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { FeePaymentMethod, SwapParams, TransactionResponse } from "../../../models";
import { RawTransaction } from "../../models";
import abi from "../../models/abi/Bridge.json";
import { Bridge as BridgeContract } from "../../models/abi/types/Bridge";
import { BaseContract, PayableTransactionObject } from "../../models/abi/types/types";
import { SendParams, TxSendParams, TxSwapParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class EvmBridgeService extends ChainBridgeService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(public web3: Web3, public api: AllbridgeCoreClient) {
    super();
  }

  async sendTx(params: TxSendParams): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionSendFromParams(params);
    return this.sendRawTransaction(rawTransaction);
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

    const bridgeContract = this.getBridgeContract(contractAddress);

    const swapMethod = bridgeContract.methods.swap(
      amount,
      fromTokenAddress,
      toTokenAddress,
      toAccountAddress,
      minimumReceiveAmount
    );

    return Promise.resolve({
      from: fromAccountAddress,
      to: contractAddress,
      data: swapMethod.encodeABI(),
    });
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
      messenger,
      fee,
      gasFeePaymentMethod,
      extraGas,
    } = params;

    const nonce = "0x" + getNonce().toString("hex");
    let swapAndBridgeMethod: PayableTransactionObject<void>;
    let value: string;
    const bridgeContract = this.getBridgeContract(contractAddress);

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
      swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
        fromTokenAddress,
        amount,
        toAccountAddress,
        toChainId,
        toTokenAddress,
        nonce,
        messenger,
        totalFee
      );
      value = "0";
    } else {
      swapAndBridgeMethod = bridgeContract.methods.swapAndBridge(
        fromTokenAddress,
        amount,
        toAccountAddress,
        toChainId,
        toTokenAddress,
        nonce,
        messenger,
        0
      );
      value = totalFee;
    }

    return Promise.resolve({
      from: fromAccountAddress,
      to: contractAddress,
      value: value,
      data: swapAndBridgeMethod.encodeABI(),
    });
  }

  private async sendRawTransaction(rawTransaction: RawTransaction) {
    const estimateGas = await this.web3.eth.estimateGas(rawTransaction as TransactionConfig);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error DISABLE SITE SUGGESTED GAS FEE IN METAMASK
    // prettier-ignore
    const feeOptions: { maxPriorityFeePerGas?: number | string | BN; maxFeePerGas?: number | string | BN } = { maxPriorityFeePerGas: null, maxFeePerGas: null };
    const { transactionHash } = await this.web3.eth.sendTransaction({
      ...rawTransaction,
      gas: estimateGas,
      ...feeOptions,
    });
    return { txId: transactionHash };
  }

  private getContract<T extends BaseContract>(abiItem: AbiItem[], contractAddress: string): T {
    return new this.web3.eth.Contract(abiItem, contractAddress) as any;
  }

  private getBridgeContract(contractAddress: string): BridgeContract {
    return this.getContract<BridgeContract>(abi as AbiItem[], contractAddress);
  }
}
