import { Contract } from "web3";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { convertFloatAmountToInt, convertIntAmountToFloat } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";
import { EssentialWeb3, RawTransaction } from "../../models";
import Yield from "../../models/abi/PortfolioToken";
import {
  ChainYieldService,
  YieldBalanceParams,
  YieldDepositParams,
  YieldGetEstimatedAmountOnDepositParams,
  YieldGetWithdrawProportionAmountParams,
  YieldWithdrawParams,
} from "../models";

export class EvmYieldService extends ChainYieldService {
  chainType: ChainType.EVM = ChainType.EVM;

  constructor(
    public web3: EssentialWeb3,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async balanceOf(params: YieldBalanceParams): Promise<string> {
    const vCYD = (
      await this.getYieldContract(params.token.yieldAddress).methods.balanceOf(params.owner).call()
    ).toString();
    return convertIntAmountToFloat(vCYD, SYSTEM_PRECISION).toFixed();
  }

  async getEstimatedAmountOnDeposit(params: YieldGetEstimatedAmountOnDepositParams): Promise<string> {
    const amountInt = convertFloatAmountToInt(params.amount, params.token.decimals).toFixed();
    const resultInt = (
      await this.getYieldContract(params.token.yieldAddress)
        .methods.getEstimatedAmountOnDeposit(amountInt, params.token.yieldId)
        .call()
    ).toString();
    return convertIntAmountToFloat(resultInt, SYSTEM_PRECISION).toFixed();
  }

  async getWithdrawProportionAmount(params: YieldGetWithdrawProportionAmountParams): Promise<string[]> {
    const amountInt = convertFloatAmountToInt(params.amount, SYSTEM_PRECISION).toFixed();
    return await this.getYieldContract(params.cydToken.yieldAddress)
      .methods.getWithdrawProportionAmount(params.owner, amountInt)
      .call();
  }

  async buildRawTransactionDeposit(params: YieldDepositParams): Promise<RawTransaction> {
    return Promise.resolve({
      ...this.buildTxParams({ owner: params.owner, yieldAddress: params.token.yieldAddress }),
      data: this.getYieldContract(params.token.yieldAddress)
        .methods.deposit(params.amount, params.token.yieldId, params.minVirtualAmount)
        .encodeABI(),
    });
  }

  async buildRawTransactionWithdraw(params: YieldWithdrawParams): Promise<RawTransaction> {
    return Promise.resolve({
      ...this.buildTxParams({ owner: params.owner, yieldAddress: params.token.yieldAddress }),
      data: this.getYieldContract(params.token.yieldAddress).methods.withdraw(params.amount).encodeABI(),
    });
  }

  buildTxParams(params: { owner: string; yieldAddress: string }) {
    return {
      from: params.owner,
      to: params.yieldAddress,
      value: "0",
    };
  }

  private getYieldContract(contractAddress: string) {
    return new this.web3.eth.Contract(Yield.abi, contractAddress) as Contract<typeof Yield.abi>;
  }
}
