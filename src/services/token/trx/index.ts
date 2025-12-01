import { TronWeb } from "tronweb";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { ChainType, GetTokenBalanceParams, TransactionResponse } from "../../../models";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { amountToHex } from "../../utils";
import { sendRawTransaction } from "../../utils/trx";
import { ApproveParamsDto, ChainTokenService, GetAllowanceParamsDto } from "../models";

export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export class TronTokenService extends ChainTokenService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(
    public tronWeb: TronWeb,
    public api: AllbridgeCoreClient
  ) {
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

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    return (await this.tronWeb.trx.getBalance(params.account)).toString();
  }

  async approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    const rawTransaction = await this.buildRawTransactionApprove(params);
    return await sendRawTransaction(this.tronWeb, rawTransaction);
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

  private getContract(contractAddress: string): any {
    return this.tronWeb.contract().at(contractAddress);
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
        callValue: +value,
      },
      parameters,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw new SdkError("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }
}
