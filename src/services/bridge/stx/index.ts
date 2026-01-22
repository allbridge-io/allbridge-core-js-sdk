import { ClarigenClient, contractFactory } from "@clarigen/core";
import { createNetwork } from "@stacks/network";
import {
  ContractIdString,
  makeRandomPrivKey,
  makeUnsignedContractCall,
  parseContractId,
  PostCondition,
  PostConditionMode,
  privateKeyToPublic,
} from "@stacks/transactions";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { FeePaymentMethod } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { RawStxTransaction, TransactionResponse } from "../../models";
import { stacksContracts as contracts } from "../../models/stx/clarigen-types";
import { getTokenName } from "../../utils/stx/get-token-name";
import { getFungiblePostCondition, getStxPostCondition } from "../../utils/stx/post-conditions";
import { ChainBridgeService, SendParams, SwapParams } from "../models";
import { getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class StxBridgeService extends ChainBridgeService {
  chainType: ChainType.STX = ChainType.STX;

  private client: ClarigenClient;

  constructor(
    public nodeRpcUrl: string,
    public params: AllbridgeCoreSdkOptions,
    public api: AllbridgeCoreClient
  ) {
    super();
    const network = createNetwork({
      network: this.params.stxIsTestnet ? "testnet" : "mainnet",
      client: { baseUrl: this.nodeRpcUrl },
      apiKey: this.params.stxHeroApiKey,
    });
    this.client = new ClarigenClient(network, this.params.stxHeroApiKey);
  }

  send(_params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  async buildRawTransactionSend(params: SendParams): Promise<RawStxTransaction> {
    const txSendParams = await prepareTxSendParams(this.chainType, params, this.api);
    const { contractAddress: bridgeAddress, messenger, toChainId, toAccountAddress, toTokenAddress } = txSendParams;
    const amount = BigInt(txSendParams.amount);

    const postFungiblePostCondition = getFungiblePostCondition(
      amount,
      "lte",
      params.fromAccountAddress,
      params.sourceToken.tokenAddress,
      getTokenName(params.sourceToken)
    );
    const postStxPostCondition = getStxPostCondition(0, "gte", params.sourceToken.bridgeAddress);
    const postConditions: PostCondition[] = [postFungiblePostCondition, postStxPostCondition];

    let totalFee = BigInt(txSendParams.fee);
    if (txSendParams.extraGas) {
      totalFee = totalFee + BigInt(txSendParams.extraGas);
    }

    let feeTokenAmount: bigint;
    let feeNativeAmount: bigint;
    switch (txSendParams.gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY: {
        feeTokenAmount = 0n;
        feeNativeAmount = totalFee;
        const postUserStxPostCondition = getStxPostCondition(totalFee, "lte", params.fromAccountAddress);
        postConditions.push(postUserStxPostCondition);
        break;
      }
      case FeePaymentMethod.WITH_STABLECOIN: {
        feeTokenAmount = totalFee;
        feeNativeAmount = 0n;
        break;
      }
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("STX bridge does not support ABR0 payment method");
      default: {
        return assertNever(txSendParams.gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    const [contractPrincipal] = parseContractId(bridgeAddress as ContractIdString);

    const bridge = contractFactory(contracts.bridge, bridgeAddress);
    const { contractAddress, contractName, functionName, functionArgs } = bridge.swapAndBridge({
      ftRef: params.sourceToken.tokenAddress,
      poolRef: params.sourceToken.poolAddress,
      messengerRef: `${contractPrincipal}.messenger`,
      gasOracleRef: `${contractPrincipal}.gas-oracle`,
      amount,
      recipient: Uint8Array.from(toAccountAddress),
      destinationChainId: toChainId,
      receiveToken: Uint8Array.from(toTokenAddress),
      nonce: Uint8Array.from(getNonce()),
      messengerId: messenger,
      feeNativeAmount: feeNativeAmount,
      feeTokenAmount: feeTokenAmount,
    });

    const privateKey = makeRandomPrivKey();
    const publicKey = privateKeyToPublic(privateKey);

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      publicKey,
      validateWithAbi: true,
      network: this.client.network,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
    };
    const transaction = await makeUnsignedContractCall(txOptions);
    return transaction.serialize();
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawStxTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    const amount = BigInt(txSwapParams.amount);
    const minimumReceiveAmount = BigInt(txSwapParams.minimumReceiveAmount);

    const bridgeAddress = params.sourceToken.bridgeAddress;
    const bridge = contractFactory(contracts.bridge, bridgeAddress);
    const { contractAddress, contractName, functionName, functionArgs } = bridge.swap({
      amount,
      sendPoolRef: params.sourceToken.poolAddress,
      sendFtRef: params.sourceToken.tokenAddress,
      receivePoolRef: params.destinationToken.poolAddress,
      receiveFtRef: params.destinationToken.tokenAddress,
      recipient: params.toAccountAddress,
      receiveAmountMin: minimumReceiveAmount,
    });

    const privateKey = makeRandomPrivKey();
    const publicKey = privateKeyToPublic(privateKey);

    const postFungibleCondition = getFungiblePostCondition(
      amount,
      "lte",
      params.fromAccountAddress,
      params.sourceToken.tokenAddress,
      getTokenName(params.sourceToken)
    );

    const postFungibleMinReceiveCondition = getFungiblePostCondition(
      minimumReceiveAmount,
      "gte",
      params.destinationToken.poolAddress,
      params.destinationToken.tokenAddress,
      getTokenName(params.destinationToken)
    );

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      publicKey,
      validateWithAbi: true,
      network: this.client.network,
      postConditions: [postFungibleCondition, postFungibleMinReceiveCondition],
      postConditionMode: PostConditionMode.Deny,
    };
    const transaction = await makeUnsignedContractCall(txOptions);
    return transaction.serialize();
  }
}
