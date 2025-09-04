import { TronWeb } from "tronweb";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import Yield from "../../models/abi/PortfolioToken";
import {
  ChainYieldService,
  YieldBalanceParams,
  YieldDepositParams,
  YieldGetEstimatedAmountOnDepositParams,
  YieldGetWithdrawProportionAmountParams,
  YieldWithdrawParams,
} from "../models";

export class TronYieldService extends ChainYieldService {
  chainType: ChainType.TRX = ChainType.TRX;

  constructor(
    public tronWeb: TronWeb,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async balanceOf(params: YieldBalanceParams): Promise<string> {
    const vCYD = (
      await (await this.getContract(params.token.yieldAddress)).methods.balanceOf(params.owner).call()
    ).toString();
    return convertIntAmountToFloat(vCYD, SYSTEM_PRECISION).toFixed();
  }

  async getEstimatedAmountOnDeposit(params: YieldGetEstimatedAmountOnDepositParams): Promise<string> {
    const amountInt = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    const resultInt = (
      await (await this.getContract(params.token.yieldAddress)).methods
        .getEstimatedAmountOnDeposit(amountInt, params.token.yieldId)
        .call()
    ).toString();
    return convertIntAmountToFloat(resultInt, SYSTEM_PRECISION).toFixed();
  }

  async getWithdrawProportionAmount(params: YieldGetWithdrawProportionAmountParams): Promise<string[]> {
    const amountInt = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    const result = await (await this.getContract(params.cydToken.yieldAddress)).methods
      .getWithdrawProportionAmount(params.owner, amountInt)
      .call();
    return result.toString().split(",");
  }

  async buildRawTransactionDeposit(params: YieldDepositParams): Promise<RawTransaction> {
    const { amount, owner, token, minVirtualAmount } = params;
    const parameter = [
      { type: "uint256", value: amount },
      { type: "uint256", value: token.yieldId },
      { type: "uint256", value: minVirtualAmount },
    ];
    const methodSignature = "deposit(uint256,uint256,uint256)";

    return this.buildRawTransaction(params.token.yieldAddress, methodSignature, parameter, "0", owner);
  }

  async buildRawTransactionWithdraw(params: YieldWithdrawParams): Promise<RawTransaction> {
    const { amount, owner } = params;

    const parameter = [{ type: "uint256", value: amount }];
    const methodSignature = "withdraw(uint256)";

    return this.buildRawTransaction(params.token.yieldAddress, methodSignature, parameter, "0", owner);
  }

  private async buildRawTransaction(
    contractAddress: string,
    methodSignature: string,
    parameter: SmartContractMethodParameter[],
    value: string,
    fromAddress: string
  ): Promise<RawTransaction> {
    const transactionObject = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      methodSignature,
      {
        callValue: +value,
      },
      parameter,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw new SdkError("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private getContract(contractAddress: string): any {
    return this.tronWeb.contract(Yield.abi, contractAddress);
  }
}
