import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Big } from "big.js";
import BN from "bn.js";
import Web3 from "web3";
import { TransactionConfig } from "web3-core";
import { AbiItem } from "web3-utils";
import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { FeePaymentMethod, Messenger, SdkError, SwapParams, TransactionResponse } from "../../../models";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction } from "../../models";
import bridgeAbi from "../../models/abi/Bridge.json";
import cctpBridgeAbi from "../../models/abi/CctpBridge.json";
import { Bridge as BridgeContract } from "../../models/abi/types/Bridge";
import { CctpBridge as CctpBridgeContract } from "../../models/abi/types/CctpBridge";
import { BaseContract, PayableTransactionObject } from "../../models/abi/types/types";
import { getAssociatedAccount } from "../../utils/sol/accounts";
import { buildAnchorProvider } from "../../utils/sol/anchor-provider";
import { SendParams, TxSendParams, TxSwapParams } from "../models";
import { ChainBridgeService } from "../models/bridge";
import { formatAddress, getNonce, prepareTxSendParams, prepareTxSwapParams } from "../utils";

export class EvmBridgeService extends ChainBridgeService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(public web3: Web3, public api: AllbridgeCoreClient, private nodeRpcUrlsConfig: NodeRpcUrlsConfig) {
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
    let sendMethod: PayableTransactionObject<void>;
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
    txSendParams: TxSendParams,
    totalFee: string
  ): Promise<{
    sendMethod: PayableTransactionObject<void>;
    value: string;
  }> {
    const { amount, contractAddress, toChainId, toAccountAddress, gasFeePaymentMethod } = txSendParams;

    const cctpBridgeContract: CctpBridgeContract = this.getContract(cctpBridgeAbi as AbiItem[], contractAddress);
    let sendMethod: PayableTransactionObject<void>;
    let value: string;

    if (params.destinationToken.chainType === ChainType.SOLANA) {
      let recipientWalletAddress: string | number[];
      const receiverAccount = new PublicKey(params.toAccountAddress);
      const receiveMint = new PublicKey(params.destinationToken.tokenAddress);
      const receiveUserToken = await getAssociatedAccount(receiverAccount, receiveMint);
      const provider = buildAnchorProvider(
        this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SOL),
        params.toAccountAddress
      );
      anchor.setProvider(provider);
      const accountData = await anchor.Spl.token(provider).account.token.fetchNullable(receiveUserToken);
      if (accountData?.authority.equals(receiverAccount)) {
        recipientWalletAddress = formatAddress(receiveUserToken.toBase58(), ChainType.SOLANA, this.chainType);
      } else {
        const tokenAccounts = await provider.connection.getTokenAccountsByOwner(receiverAccount, {
          mint: receiveMint,
        });
        if (tokenAccounts.value.length === 0 && !accountData) {
          recipientWalletAddress = formatAddress(receiveUserToken.toBase58(), ChainType.SOLANA, this.chainType);
        } else if (tokenAccounts.value.length > 0) {
          recipientWalletAddress = formatAddress(
            tokenAccounts.value[0].pubkey.toBase58(),
            ChainType.SOLANA,
            this.chainType
          );
        } else {
          throw new SdkError("Associated account has wrong owner");
        }
      }

      if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
        sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
          amount,
          recipientWalletAddress,
          toAccountAddress,
          toChainId,
          totalFee
        );
        value = "0";
      } else {
        sendMethod = cctpBridgeContract.methods.bridgeWithWalletAddress(
          amount,
          recipientWalletAddress,
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
    const estimateGas = await this.web3.eth.estimateGas(rawTransaction as TransactionConfig);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error DISABLE SITE SUGGESTED GAS FEE IN METAMASK
    // prettier-ignore
    const feeOptions: { maxPriorityFeePerGas?: number | string | BN; maxFeePerGas?: number | string | BN } = { maxPriorityFeePerGas: null, maxFeePerGas: null };
    const { transactionHash } = await this.web3.eth.sendTransaction({
      ...(rawTransaction as Object),
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
