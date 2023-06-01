// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { Pool, TokenWithChainDetails } from "../../../tokens-info";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalanceInfo } from "../models";
import { ChainPoolService } from "../models/pool";

export class TronPoolService extends ChainPoolService {
  chainType: ChainType.TRX = ChainType.TRX;
  private P = 52;

  constructor(public tronWeb: typeof TronWeb, public api: AllbridgeCoreClient) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const contract = await this.getContract(token.poolAddress);
    const rewardDebt = (await contract.methods.userRewardDebt(accountAddress).call()).toString();
    const lpAmount = (await contract.methods.balanceOf(accountAddress).call()).toString();
    return new UserBalanceInfo({ lpAmount, rewardDebt });
  }

  async getPool(token: TokenWithChainDetails): Promise<Pool> {
    const poolContract = await this.getContract(token.poolAddress);

    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all([
      poolContract.methods.a().call(),
      poolContract.methods.d().call(),
      poolContract.methods.tokenBalance().call(),
      poolContract.methods.vUsdBalance().call(),
      poolContract.methods.totalSupply().call(),
      poolContract.methods.accRewardPerShareP().call(),
    ]);

    return {
      aValue: aValue.toString(),
      dValue: dValue.toString(),
      tokenBalance: tokenBalance.toString(),
      vUsdBalance: vUsdBalance.toString(),
      totalLpAmount: totalLpAmount.toString(),
      accRewardPerShareP: accRewardPerShareP.toString(),
      p: this.P,
    };
  }

  buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { amount, accountAddress } = params;

    const parameter = [{ type: "uint256", value: amount }];
    const methodSignature = "deposit(uint256)";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
  }

  buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { amount, accountAddress } = params;

    const parameter = [{ type: "uint256", value: amount }];
    const methodSignature = "withdraw(uint256)";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
  }

  buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const { accountAddress } = params;

    const parameter: SmartContractMethodParameter[] = [];
    const methodSignature = "claimRewards()";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
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
        callValue: value,
      },
      parameter,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw Error("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private getContract(contractAddress: string): Promise<any> {
    return this.tronWeb.contract().at(contractAddress);
  }
}
