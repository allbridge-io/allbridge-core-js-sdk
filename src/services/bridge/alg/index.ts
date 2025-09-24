import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import algosdk, { Address } from "algosdk";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { FeePaymentMethod } from "../../../models";
import { RawTransaction, TransactionResponse } from "../../models";
import { BridgeClient } from "../../models/alg/BridgeClient";
import { addBudgetNoops, checkAssetOptIn, feeForInner, populateAndEncodeTxs } from "../../utils/alg";
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
  }

  send(_params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);

    if (!params.sourceToken.bridgeId) {
      throw new SdkError("ALG sourceToken must contain 'bridgeId'");
    }
    const bridgeId = BigInt(params.sourceToken.bridgeId);
    const bridge = this.getBridge(bridgeId);
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
    const isPayWithStable = txSendParams.gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN;

    const composer = this.algorand.newGroup();

    let feeTokenAmount: bigint;
    let totalAmount: bigint;
    if (isPayWithStable) {
      feeTokenAmount = totalFee;
      totalAmount = amount + feeTokenAmount;
    } else {
      composer.addPayment({
        sender,
        receiver: bridge.appAddress,
        amount: AlgoAmount.MicroAlgo(totalFee),
      });
      feeTokenAmount = 0n;
      totalAmount = amount;
    }
    composer
      .addAssetTransfer({
        assetId: tokenId,
        amount: totalAmount,
        sender,
        receiver: bridge.appAddress,
      })
      .addAppCallMethodCall(
        await bridge.params.swapAndBridge({
          args: {
            tokenId,
            recipient,
            destinationChainId,
            receiveToken,
            nonce,
            feeTokenAmount,
          },
          sender,
          extraFee: feeForInner(isPayWithStable ? 9 : 8),
        })
      );
    addBudgetNoops({
      composer,
      appId: bridgeId,
      sender,
      count: isPayWithStable ? 3 : 2,
    });
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
    const bridgeId = BigInt(params.sourceToken.bridgeId);
    const bridge = this.getBridge(bridgeId);

    const composer = this.algorand.newGroup();

    if (params.fromAccountAddress === recipient) {
      const optIn = await checkAssetOptIn(receiveTokenId, recipient, this.algorand);
      if (!optIn) {
        composer.addAssetOptIn({ sender: sender, assetId: receiveTokenId });
      }
    }

    composer.addAssetTransfer({
      assetId: tokenId,
      amount: amount,
      sender,
      receiver: bridge.appAddress,
    });
    composer.addAppCallMethodCall(
      await bridge.params.swap({
        args: { tokenId, recipient, receiveTokenId, receiveAmountMin },
        sender,
        extraFee: feeForInner(4),
      })
    );
    addBudgetNoops({
      composer,
      appId: bridgeId,
      sender,
      count: 1,
    });
    const { transactions } = await composer.buildTransactions();
    return populateAndEncodeTxs(transactions, sender, this.algorand.client.algod);
  }

  private getBridge(appId: bigint): BridgeClient {
    return this.algorand.client.getTypedAppClientById(BridgeClient, { appId });
  }
}
