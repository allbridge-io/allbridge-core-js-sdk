import Big from "big.js";
import BN from "bn.js";
import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { FeePaymentMethod, Messenger, SwapParams, TransactionResponse } from "../../../models";
import { RawTransaction } from "../../models";
import bridgeAbi from "../../models/abi/Bridge.json";
import cctpBridgeAbi from "../../models/abi/CctpBridge.json";
import { Bridge as BridgeContract } from "../../models/abi/types/Bridge";
import { CctpBridge as CctpBridgeContract } from "../../models/abi/types/CctpBridge";
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
    let sendMethod: PayableTransactionObject<void>;
    let value: string;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }
    if (messenger === Messenger.CCTP) {
      const cctpBridgeContract: CctpBridgeContract = this.getContract(cctpBridgeAbi as AbiItem[], contractAddress);
      if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
        sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, totalFee);
        value = "0";
      } else {
        sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, 0);
        value = totalFee;
      }
    } else {
      const bridgeContract = this.getBridgeContract(contractAddress);
      if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
        sendMethod = bridgeContract.methods.swapAndBridge(
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
        sendMethod = bridgeContract.methods.swapAndBridge(
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
    }

    return Promise.resolve({
      from: fromAccountAddress,
      to: contractAddress,
      value: value,
      data: sendMethod.encodeABI(),
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
    return this.getContract<BridgeContract>(bridgeAbi as AbiItem[], contractAddress);
  }
}
