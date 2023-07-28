// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { GetTokenBalanceParams, TransactionResponse } from "../../../models";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { amountToHex, sleep } from "../../utils";
import { ApproveParamsDto, GetAllowanceParamsDto } from "../models";
import { ChainTokenService } from "../models/token";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronTokenService extends ChainTokenService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(public tronWeb: typeof TronWeb, public api: AllbridgeCoreClient) {
    super();
  }

  async getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    const {
      token: { tokenAddress },
      owner,
    } = params;
    const tokenContract = await this.getContract(tokenAddress);
    const allowance = await tokenContract.methods.allowance(owner, params.spender).call();
    return allowance.toString();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    const contract = await this.getContract(params.token.tokenAddress);
    const balance = await contract.balanceOf(params.account).call();
    return balance.toString();
  }

  async approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionApprove(params);
    return await this.sendRawTransaction(rawTransaction);
  }

  async buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
    const { tokenAddress, spender, owner, amount } = params;
    const amountHex = amount == undefined ? MAX_AMOUNT : amountToHex(amount);

    const parameter = [
      { type: "address", value: spender },
      { type: "uint256", value: amountHex },
    ];
    const value = "0";
    const methodSignature = "approve(address,uint256)";
    return this.buildRawTransaction(tokenAddress, methodSignature, parameter, value, owner);
  }

  private getContract(contractAddress: string): Promise<any> {
    return this.tronWeb.contract().at(contractAddress);
  }

  private async verifyTx(txId: string, timeout = 10000): Promise<any> {
    const start = Date.now();
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition */
    while (true) {
      if (Date.now() - start > timeout) {
        throw new Error("Transaction not found");
      }
      const result = await this.tronWeb.trx.getUnconfirmedTransactionInfo(txId);
      if (!result?.receipt) {
        await sleep(2000);
        continue;
      }
      if (result.receipt.result === "SUCCESS") {
        return result;
      } else {
        /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
        throw new Error(`Transaction status is ${result.receipt.result}`);
      }
    }
  }

  private async buildRawTransaction(
    contractAddress: string,
    methodSignature: string,
    parameters: SmartContractMethodParameter[],
    value: string,
    fromAddress: string
  ): Promise<RawTransaction> {
    const transactionObject = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      methodSignature,
      {
        callValue: value,
      },
      parameters,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw Error("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private async sendRawTransaction(rawTransaction: RawTransaction) {
    const signedTx = await this.tronWeb.trx.sign(rawTransaction);

    if (!signedTx.signature) {
      throw Error("Transaction was not signed properly");
    }

    const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);

    const transactionHash = receipt.transaction.txID;
    await this.verifyTx(transactionHash);
    return { txId: transactionHash };
  }
}
