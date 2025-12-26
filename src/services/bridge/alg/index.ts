import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import algosdk, { Address } from "algosdk";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { FeePaymentMethod } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawTransaction, TransactionResponse } from "../../models";
import { BridgeClient } from "../../models/alg/BridgeClient";
import { PaddingUtilClient } from "../../models/alg/PaddingUtilClient";
import { checkAssetOptIn, feeForInner, populateAndEncodeTxs } from "../../utils/alg";
import { ChainBridgeService, SendParams, SwapParams } from "../models";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class AlgBridgeService extends ChainBridgeService {
  chainType: ChainType.ALG = ChainType.ALG;

  constructor(
    public algorand: AlgorandClient,
    public api: AllbridgeCoreClient
  ) {
    super();
    algorand.setDefaultSigner(
      algosdk.makeBasicAccountTransactionSigner(
        algosdk.mnemonicToSecretKey(
          "tunnel gym elevator pulse motor evolve release orange culture make sister approve winter chair armor grocery distance festival tiger holiday dish wisdom region absorb secret"
        )
      )
    );
    algorand.setDefaultValidityWindow(100);
  }

  send(_params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);

    if (!params.sourceToken.bridgeId) {
      throw new SdkError("ALG sourceToken must contain 'bridgeId'");
    }
    if (!params.sourceToken.paddingUtilId) {
      throw new SdkError("ALG sourceToken must contain 'paddingUtilId'");
    }
    const bridgeId = BigInt(params.sourceToken.bridgeId);
    const bridge = this.getBridge(bridgeId);
    const paddingUtilId = BigInt(params.sourceToken.paddingUtilId);
    const paddingUtil = this.getPaddingUtil(paddingUtilId);
    const sender = Address.fromString(params.fromAccountAddress);
    const tokenId = BigInt(params.sourceToken.tokenAddress);
    const destinationChainId = txSendParams.toChainId;
    const recipient = txSendParams.toAccountAddress;
    const receiveToken = txSendParams.toTokenAddress;
    const nonce = getNonce();
    const amount = BigInt(txSendParams.amount);

    let totalFee = BigInt(txSendParams.fee);
    if (txSendParams.extraGas) {
      totalFee = totalFee + BigInt(txSendParams.extraGas);
    }

    const composer = this.algorand.newGroup();

    const assetTransferTx = await this.algorand.createTransaction.assetTransfer({
      amount,
      assetId: tokenId,
      receiver: bridge.appAddress,
      sender,
    });

    switch (txSendParams.gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        const paymentTx = await this.algorand.createTransaction.payment({
          amount: AlgoAmount.MicroAlgo(totalFee),
          receiver: bridge.appAddress,
          sender,
        });
        composer.addAppCallMethodCall(
          await bridge.params.swapAndBridge({
            args: {
              paymentRef: paymentTx,
              assetTransferRef: assetTransferTx,
              recipient,
              destinationChainId,
              receiveToken,
              nonce,
            },
            sender,
            extraFee: feeForInner(8),
          })
        );
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        composer.addAppCallMethodCall(
          await bridge.params.swapAndBridgeWithStable({
            args: {
              assetTransferRef: assetTransferTx,
              recipient,
              destinationChainId,
              receiveToken,
              nonce,
              feeTokenAmount: totalFee,
            },
            sender,
            extraFee: feeForInner(9),
          })
        );
        const paddingTx = await this.algorand.createTransaction.appCall({
          appId: paddingUtil.appId,
          sender,
          note: "padding_1",
        });
        composer.addTransaction(paddingTx);
        break;
      }
      case FeePaymentMethod.WITH_ARB:
        throw new SdkError("ALG bridge does not support ARB0 payment method");
      default: {
        return assertNever(txSendParams.gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    const paddingTx = await this.algorand.createTransaction.appCall({
      appId: paddingUtil.appId,
      sender,
      note: "padding",
    });
    composer.addTransaction(paddingTx);
    const paddingTx2 = await this.algorand.createTransaction.appCall({
      appId: paddingUtil.appId,
      sender,
      note: "padding2",
    });
    composer.addTransaction(paddingTx2);

    const { transactions } = await composer.buildTransactions();
    return populateAndEncodeTxs(transactions, sender, this.algorand.client.algod);
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);

    const sender = Address.fromString(params.fromAccountAddress);
    const recipient = params.toAccountAddress;
    const tokenId = BigInt(params.sourceToken.tokenAddress);
    const receiveTokenId = BigInt(params.destinationToken.tokenAddress);
    const receiveAmountMin = BigInt(txSwapParams.minimumReceiveAmount);
    const amount = BigInt(txSwapParams.amount);

    if (!params.sourceToken.bridgeId) {
      throw new SdkError("ALG sourceToken must contain 'bridgeId'");
    }
    if (!params.sourceToken.paddingUtilId) {
      throw new SdkError("ALG sourceToken must contain 'paddingUtilId'");
    }
    const bridgeId = BigInt(params.sourceToken.bridgeId);
    const bridge = this.getBridge(bridgeId);
    const paddingUtilId = BigInt(params.sourceToken.paddingUtilId);
    const paddingUtil = this.getPaddingUtil(paddingUtilId);

    const composer = this.algorand.newGroup();

    if (params.fromAccountAddress === recipient) {
      const optIn = await checkAssetOptIn(receiveTokenId, recipient, this.algorand);
      if (!optIn) {
        composer.addAssetOptIn({ sender: sender, assetId: receiveTokenId });
      }
    }

    const assetTransfer = this.algorand.createTransaction.assetTransfer({
      assetId: tokenId,
      amount: amount,
      sender,
      receiver: bridge.appAddress,
    });
    composer.addAppCallMethodCall(
      await bridge.params.swap({
        args: { assetTransferRef: assetTransfer, recipient, receiveAsset: receiveTokenId, receiveAmountMin },
        sender,
        extraFee: feeForInner(4),
      })
    );
    const paddingTx = await this.algorand.createTransaction.appCall({
      appId: paddingUtil.appId,
      sender,
    });
    composer.addTransaction(paddingTx);
    const { transactions } = await composer.buildTransactions();
    return populateAndEncodeTxs(transactions, sender, this.algorand.client.algod);
  }

  private getBridge(appId: bigint): BridgeClient {
    return this.algorand.client.getTypedAppClientById(BridgeClient, { appId });
  }

  private getPaddingUtil(appId: bigint): PaddingUtilClient {
    return this.algorand.client.getTypedAppClientById(PaddingUtilClient, { appId });
  }
}
