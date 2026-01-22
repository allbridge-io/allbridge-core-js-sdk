import { Address, contract } from "@stellar/stellar-sdk";
import { Big } from "big.js";
import { ChainSymbol } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { MethodNotSupportedError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions, ChainType } from "../../../index";
import { FeePaymentMethod } from "../../../models";
import { assertNever } from "../../../utils/utils";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction, TransactionResponse } from "../../models";
import { BridgeContract } from "../../models/srb/bridge-contract";
import { ChainBridgeService, SendParams, SwapParams, TxSendParamsSrb, TxSwapParamsSol } from "../models";
import { getNonceBigInt, prepareTxSendParams, prepareTxSwapParams } from "../utils";
import ContractClientOptions = contract.ClientOptions;

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

  async buildRawTransactionSendFromParams(params: TxSendParamsSrb): Promise<RawTransaction> {
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
    const contract = this.getContract(BridgeContract, contractAddress, fromAccountAddress);
    let tx;
    switch (gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY:
        tx = await contract.swap_and_bridge({
          sender: fromAccountAddress,
          token: Address.contract(Buffer.from(fromTokenAddress)).toString(),
          amount: BigInt(amount),
          recipient: Buffer.from(toAccountAddress),
          destination_chain_id: +toChainId,
          receive_token: Buffer.from(toTokenAddress),
          nonce: getNonceBigInt(),
          gas_amount: BigInt(totalFee),
          fee_token_amount: BigInt(0),
        });
        break;
      case FeePaymentMethod.WITH_STABLECOIN:
        tx = await contract.swap_and_bridge({
          sender: fromAccountAddress,
          token: Address.contract(Buffer.from(fromTokenAddress)).toString(),
          amount: BigInt(amount),
          recipient: Buffer.from(toAccountAddress),
          destination_chain_id: +toChainId,
          receive_token: Buffer.from(toTokenAddress),
          nonce: getNonceBigInt(),
          gas_amount: BigInt(0),
          fee_token_amount: BigInt(totalFee),
        });
        break;
      case FeePaymentMethod.WITH_ABR:
        throw new SdkError("SRB bridge does not support ABR payment method");
      default: {
        return assertNever(gasFeePaymentMethod, "Unhandled FeePaymentMethod");
      }
    }

    return tx.toXDR();
  }

  async buildRawTransactionSwap(params: SwapParams): Promise<RawTransaction> {
    const txSwapParams = prepareTxSwapParams(this.chainType, params);
    return await this.buildRawTransactionSwapFromParams(txSwapParams);
  }

  async buildRawTransactionSwapFromParams(params: TxSwapParamsSol): Promise<RawTransaction> {
    const {
      amount,
      contractAddress,
      fromAccountAddress,
      fromTokenAddress,
      toAccountAddress,
      toTokenAddress,
      minimumReceiveAmount,
    } = params;
    const contract = this.getContract(BridgeContract, contractAddress, fromAccountAddress);
    return (
      await contract.swap({
        sender: fromAccountAddress,
        amount: BigInt(amount),
        token: Address.contract(Buffer.from(fromTokenAddress)).toBuffer(),
        receive_token: Buffer.from(toTokenAddress),
        recipient: toAccountAddress,
        receive_amount_min: BigInt(minimumReceiveAmount),
      })
    ).toXDR();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(params: SendParams): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  private getContract<T>(contract: new (args: ContractClientOptions) => T, address: string, sender?: string): T {
    const config: ContractClientOptions = {
      publicKey: sender,
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new contract(config);
  }
}
