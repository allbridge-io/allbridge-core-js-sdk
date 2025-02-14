import { Big } from "big.js";
import BN from "bn.js";
import { Contract, Transaction as Web3Transaction } from "web3";
import { PayableMethodObject } from "web3-eth-contract";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  ChainSymbol,
  ChainType,
  FeePaymentMethod,
  Messenger,
  EssentialWeb3,
  SwapParams,
  TransactionResponse,
} from "../../../models";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction } from "../../models";
import Bridge from "../../models/abi/Bridge";
import CctpBridge from "../../models/abi/CctpBridge";
import { getCctpSolTokenRecipientAddress } from "../get-cctp-sol-token-recipient-address";
import { SendParams, ChainBridgeService, TxSwapParamsEvm, TxSendParamsEvm } from "../models";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class EvmBridgeService extends ChainBridgeService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(
    public web3: EssentialWeb3,
    public api: AllbridgeCoreClient,
    private nodeRpcUrlsConfig: NodeRpcUrlsConfig
  ) {
    super();
  }

  async send(params: SendParams): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionSend(params);
    return this.sendRawTransaction(rawTransaction);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  async buildRawTransactionSwapFromParams(params: TxSwapParamsEvm): Promise<RawTransaction> {
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
    } = txSendParams;

    const nonce = "0x" + getNonce().toString("hex");
    let sendMethod: PayableMethodObject;
    let value: string;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }
    if (messenger === Messenger.CCTP) {
      const cctp = await this.buildRawTransactionCctpSend(params, txSendParams, totalFee);
      sendMethod = cctp.sendMethod;
      value = cctp.value;
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

  private async buildRawTransactionCctpSend(
    params: SendParams,
    txSendParams: TxSendParamsEvm,
    totalFee: string
  ): Promise<{
    sendMethod: PayableMethodObject;
    value: string;
  }> {
    const { amount, contractAddress, toChainId, toAccountAddress, gasFeePaymentMethod } = txSendParams;

    const cctpBridgeContract = this.getCctpBridgeContract(contractAddress);
    let sendMethod: PayableMethodObject;
    let value: string;

    if (params.destinationToken.chainType === ChainType.SOLANA) {
      const recipient = await getCctpSolTokenRecipientAddress(
        this.chainType,
        params.toAccountAddress,
        params.destinationToken.tokenAddress,
        this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL)
      );

      if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
        sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
          amount,
          recipient,
          toAccountAddress,
          toChainId,
          totalFee
        );
        value = "0";
      } else {
        sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
          amount,
          recipient,
          toAccountAddress,
          toChainId,
          0
        );
        value = totalFee;
      }
    } else {
      if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
        sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, totalFee);
        value = "0";
      } else {
        sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, 0);
        value = totalFee;
      }
    }
    return { sendMethod, value };
  }

  private async sendRawTransaction(rawTransaction: RawTransaction) {
    const estimateGas = await this.web3.eth.estimateGas(rawTransaction as Web3Transaction);

    // @ts-expect-error DISABLE SITE SUGGESTED GAS FEE IN METAMASK
    // prettier-ignore
    const feeOptions: { maxPriorityFeePerGas?: number | string | BN; maxFeePerGas?: number | string | BN } = { maxPriorityFeePerGas: null, maxFeePerGas: null };
    const { transactionHash } = await this.web3.eth.sendTransaction({
      ...(rawTransaction as object),
      gas: estimateGas,
      ...feeOptions,
    } as Web3Transaction);
    return { txId: transactionHash.toString() };
  }

  private getBridgeContract(contractAddress: string) {
    return new this.web3.eth.Contract(Bridge.abi, contractAddress) as Contract<typeof Bridge.abi>;
  }

  private getCctpBridgeContract(contractAddress: string) {
    return new this.web3.eth.Contract(CctpBridge.abi, contractAddress) as Contract<typeof CctpBridge.abi>;
  }
}
