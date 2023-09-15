import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { promiseWithTimeout } from "../../../utils";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { RawTransaction } from "../../models";
import PoolAbi from "../../models/abi/Pool.json";
import { Pool as PoolContract } from "../../models/abi/types/Pool";
import { BaseContract } from "../../models/abi/types/types";
import { promisify } from "../../utils";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalance, UserBalanceInfo } from "../models";
import { ChainPoolService } from "../models/pool";

export class EvmPoolService extends ChainPoolService {
  chainType: ChainType.EVM = ChainType.EVM;
  private P = 52;

  constructor(public web3: Web3, public api: AllbridgeCoreClient) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    let userBalanceInfo;
    try {
      userBalanceInfo = await promiseWithTimeout(
        this.getUserBalanceInfoByBatch(accountAddress, token),
        `Cannot get UserBalanceInfo for ${token.name}`,
        5000
      );
    } catch (err) {
      userBalanceInfo = await promiseWithTimeout(
        this.getUserBalanceInfoPerProperty(accountAddress, token),
        `Cannot get UserBalanceInfo for ${token.name}`,
        5000
      );
    }
    return userBalanceInfo;
  }

  private async getUserBalanceInfoByBatch(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const batch = new this.web3.BatchRequest();
    const contract = new this.web3.eth.Contract(PoolAbi as AbiItem[], token.poolAddress);
    const arr = ["userRewardDebt", "balanceOf"].map((methodName) =>
      promisify((cb: any) => batch.add(contract.methods[methodName](accountAddress).call.request({}, cb)))()
    );
    batch.execute();
    const [rewardDebt, lpAmount] = await Promise.all(arr);
    return new UserBalance({ lpAmount, rewardDebt });
  }

  private async getUserBalanceInfoPerProperty(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const rewardDebt = await this.getPoolContract(token.poolAddress).methods.userRewardDebt(accountAddress).call();
    const lpAmount = await this.getPoolContract(token.poolAddress).methods.balanceOf(accountAddress).call();
    return new UserBalance({ lpAmount, rewardDebt });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    let poolInfo;
    try {
      poolInfo = await promiseWithTimeout(
        this.getPoolInfoByBatch(token),
        `Cannot get PoolInfo for ${token.name}`,
        5000
      );
    } catch (err) {
      poolInfo = await promiseWithTimeout(
        this.getPoolInfoPerProperty(token),
        `Cannot get PoolInfo for ${token.name}`,
        5000
      );
    }
    return poolInfo;
  }

  private async getPoolInfoByBatch(token: TokenWithChainDetails): Promise<PoolInfo> {
    const batch = new this.web3.BatchRequest();
    const contract = new this.web3.eth.Contract(PoolAbi as AbiItem[], token.poolAddress);
    const arr = ["a", "d", "tokenBalance", "vUsdBalance", "totalSupply", "accRewardPerShareP"].map((methodName) =>
      promisify((cb: any) => batch.add(contract.methods[methodName]().call.request({}, cb)))()
    );
    batch.execute();

    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all(arr);
    const tokenBalanceStr = tokenBalance.toString();
    const vUsdBalanceStr = vUsdBalance.toString();
    const imbalance = calculatePoolInfoImbalance({ tokenBalance: tokenBalanceStr, vUsdBalance: vUsdBalanceStr });
    return {
      aValue: aValue.toString(),
      dValue: dValue.toString(),
      tokenBalance: tokenBalanceStr,
      vUsdBalance: vUsdBalanceStr,
      totalLpAmount: totalLpAmount.toString(),
      accRewardPerShareP: accRewardPerShareP.toString(),
      p: this.P,
      imbalance,
    };
  }

  private async getPoolInfoPerProperty(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = this.getPoolContract(token.poolAddress);
    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all([
      poolContract.methods.a().call(),
      poolContract.methods.d().call(),
      poolContract.methods.tokenBalance().call(),
      poolContract.methods.vUsdBalance().call(),
      poolContract.methods.totalSupply().call(),
      poolContract.methods.accRewardPerShareP().call(),
    ]);
    const imbalance = calculatePoolInfoImbalance({ tokenBalance, vUsdBalance });

    return {
      aValue,
      dValue,
      tokenBalance,
      vUsdBalance,
      totalLpAmount,
      accRewardPerShareP,
      p: this.P,
      imbalance,
    };
  }

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    return Promise.resolve({
      ...this.buildTxParams(params),
      data: this.getPoolContract(params.token.poolAddress).methods.deposit(params.amount).encodeABI(),
    });
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    return Promise.resolve({
      ...this.buildTxParams(params),
      data: this.getPoolContract(params.token.poolAddress).methods.withdraw(params.amount).encodeABI(),
    });
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    return Promise.resolve({
      ...this.buildTxParams(params),
      data: this.getPoolContract(params.token.poolAddress).methods.claimRewards().encodeABI(),
    });
  }

  buildTxParams(params: LiquidityPoolsParams) {
    return {
      from: params.accountAddress,
      to: params.token.poolAddress,
      value: "0",
    };
  }

  private getContract<T extends BaseContract>(abiItem: AbiItem[], contractAddress: string): T {
    return new this.web3.eth.Contract(abiItem, contractAddress) as any;
  }

  private getPoolContract(contractAddress: string): PoolContract {
    return this.getContract<PoolContract>(PoolAbi as AbiItem[], contractAddress);
  }
}
