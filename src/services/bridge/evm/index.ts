import { Big } from "big.js";
import BN from "bn.js";
import { Contract, Transaction as Web3Transaction } from "web3";
import { PayableMethodObject } from "web3-eth-contract";
import { Chains } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  ChainSymbol,
  ChainType,
  EssentialWeb3,
  FeePaymentMethod,
  Messenger,
  SdkError,
  SwapParams,
  TransactionResponse,
} from "../../../models";
import { convertAmountPrecision } from "../../../utils/calculation";
import { assertNever } from "../../../utils/utils";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction } from "../../models";
import Bridge from "../../models/abi/Bridge";
import CctpBridge from "../../models/abi/CctpBridge";
import OftBridge from "../../models/abi/OftBridge";
import PayerWithAbr from "../../models/abi/PayerWithAbr";
import { getCctpSolTokenRecipientAddress } from "../get-cctp-sol-token-recipient-address";
import { ChainBridgeService, SendParams, TxSendParamsEvm, TxSwapParamsEvm } from "../models";
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
      extraGasDest,
      abrExchangeRate,
    } = txSendParams;

    const nonce = "0x" + getNonce().toString("hex");
    let sendMethod: PayableMethodObject;
    let value: string;

    let totalFee = fee;
    if (extraGas) {
      totalFee = Big(totalFee).plus(extraGas).toFixed();
    }

    console.log("@@ raw fee", fee);
    console.log("@@ raw extraGas", extraGas);
    console.log("@@ raw totalFee", totalFee);

    let totalFeeInAbr: string | undefined;
    if (gasFeePaymentMethod === FeePaymentMethod.WITH_ARB) {
      if (!abrExchangeRate) {
        throw new SdkError("Cannot find 'abrExchangeRate' for ARB0 payment method");
      }
      if (!params.sourceToken.abrPayer) {
        throw new SdkError("Source token must contain 'abrPayer' for ARB0 payment method");
      }
      totalFeeInAbr = totalFee;
      const totalFeeInNativeRaw = Big(totalFee).div(abrExchangeRate);
      totalFee = convertAmountPrecision(
        totalFeeInNativeRaw,
        params.sourceToken.abrPayer.abrToken.decimals,
        Chains.getChainDecimalsByType(params.sourceToken.chainType)
      ).toFixed();
      console.log("@@ WITH_ARB totalAbr", totalFeeInAbr);
      console.log("@@ WITH_ARB totalFee", totalFee);
    }

    switch (messenger) {
      case Messenger.CCTP:
      case Messenger.CCTP_V2: {
        const cctp = await this.buildRawTransactionCctpSend(params, txSendParams, totalFee);
        sendMethod = cctp.sendMethod;
        value = cctp.value;
        break;
      }
      case Messenger.OFT: {
        const oft = this.buildRawTransactionOftSend(params, txSendParams, totalFee, extraGasDest);
        sendMethod = oft.sendMethod;
        value = oft.value;
        break;
      }
      case Messenger.ALLBRIDGE:
      case Messenger.WORMHOLE:
        {
          const bridgeContract = this.getBridgeContract(contractAddress);
          switch (gasFeePaymentMethod) {
            case FeePaymentMethod.WITH_ARB:
            case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
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
              break;
            }
            case FeePaymentMethod.WITH_STABLECOIN: {
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
              break;
            }
            default: {
              return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
            }
          }
        }
        break;
    }

    if (gasFeePaymentMethod === FeePaymentMethod.WITH_ARB) {
      if (!params.sourceToken.abrPayer) {
        throw new SdkError("Source token must contain 'abrPayer' for ARB0 payment method");
      }

      const abrPayerAddress = params.sourceToken.abrPayer.payerAddress;

      if (!totalFeeInAbr) {
        throw new SdkError("Failed to calculate totalFeeInAbr");
      }
      const abrPayerContract = this.getAbrPayerContract(abrPayerAddress);

      const abi = sendMethod.encodeABI();
      const withoutSelector = "0x" + abi.slice(10);
      sendMethod = abrPayerContract.methods.transferTokensAndCallTarget(
        params.sourceToken.tokenAddress,
        amount,
        totalFeeInAbr,
        messenger,
        withoutSelector
      );

      return Promise.resolve({
        from: fromAccountAddress,
        to: abrPayerAddress,
        value: "0",
        data: sendMethod.encodeABI(),
      });
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

      switch (gasFeePaymentMethod) {
        case FeePaymentMethod.WITH_ARB:
        case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
          sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
            amount,
            recipient,
            toAccountAddress,
            toChainId,
            0
          );
          value = totalFee;
          break;
        }
        case FeePaymentMethod.WITH_STABLECOIN: {
          sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
            amount,
            recipient,
            toAccountAddress,
            toChainId,
            totalFee
          );
          value = "0";
          break;
        }
        default: {
          return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
        }
      }
    } else {
      switch (gasFeePaymentMethod) {
        case FeePaymentMethod.WITH_ARB:
        case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
          sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, 0);
          value = totalFee;
          break;
        }
        case FeePaymentMethod.WITH_STABLECOIN: {
          sendMethod = cctpBridgeContract.methods.bridge(amount, toAccountAddress, toChainId, totalFee);
          value = "0";
          break;
        }
        default: {
          return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
        }
      }
    }
    return { sendMethod, value };
  }

  private buildRawTransactionOftSend(
    params: SendParams,
    txSendParams: TxSendParamsEvm,
    totalFee: string,
    extraGasDest?: string
  ): {
    sendMethod: PayableMethodObject;
    value: string;
  } {
    const { amount, contractAddress, toChainId, toAccountAddress, gasFeePaymentMethod } = txSendParams;

    const oftBridgeContract = this.getOftBridgeContract(contractAddress);
    let sendMethod: PayableMethodObject;
    let value: string;

    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_ARB:
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        sendMethod = oftBridgeContract.methods.bridge(
          params.sourceToken.tokenAddress,
          amount,
          toAccountAddress,
          toChainId,
          0,
          extraGasDest ?? "0",
          "10"
        );
        value = totalFee;
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        sendMethod = oftBridgeContract.methods.bridge(
          params.sourceToken.tokenAddress,
          amount,
          toAccountAddress,
          toChainId,
          totalFee,
          extraGasDest ?? "0",
          "10"
        );
        value = "0";
        break;
      }
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
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

  private getOftBridgeContract(contractAddress: string) {
    return new this.web3.eth.Contract(OftBridge.abi, contractAddress) as Contract<typeof OftBridge.abi>;
  }

  private getAbrPayerContract(contractAddress: string) {
    return new this.web3.eth.Contract(PayerWithAbr.abi, contractAddress) as Contract<typeof PayerWithAbr.abi>;
  }
}
