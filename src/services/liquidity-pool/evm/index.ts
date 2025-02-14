import { Contract, Web3 } from "web3";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { promiseWithTimeout, promiseWithTimeoutAndRetries } from "../../../utils/utils";
import { EssentialWeb3, RawTransaction } from "../../models";
import Pool from "../../models/abi/Pool";
import {
  ChainPoolService,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
} from "../models";

export class EvmPoolService extends ChainPoolService {
  chainType: ChainType.EVM = ChainType.EVM;
  private P = 52;

  constructor(
    public web3: EssentialWeb3,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    let userBalanceInfo;
    try {
      userBalanceInfo = await promiseWithTimeout(
        this.getUserBalanceInfoByBatch(accountAddress, token),
        `Cannot get UserBalanceInfo for ${token.name} on ${token.chainSymbol}`,
        5000
      );
    } catch (ignoreError) {
      userBalanceInfo = await promiseWithTimeoutAndRetries(
        () => this.getUserBalanceInfoPerProperty(accountAddress, token),
        `Cannot get UserBalanceInfo for ${token.name} on ${token.chainSymbol}`,
        5,
        2000
      );
    }
    return userBalanceInfo;
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    let poolInfo;
    try {
      poolInfo = await promiseWithTimeout(
        this.getPoolInfoByBatch(token),
        `Cannot get PoolInfo for ${token.name} on ${token.chainSymbol}`,
        5000
      );
    } catch (ignoreError) {
      poolInfo = await promiseWithTimeoutAndRetries(
        () => this.getPoolInfoPerProperty(token),
        `Cannot get PoolInfo for ${token.name} on ${token.chainSymbol}`,
        5,
        2000
      );
    }
    return poolInfo;
  }

  private async getUserBalanceInfoByBatch(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const batch = new this.web3.eth.BatchRequest();
    const poolContract = this.getPoolContract(token.poolAddress);

    const userRewardDebtAbi = poolContract.methods.userRewardDebt(accountAddress).encodeABI();
    const balanceOfAbi = poolContract.methods.balanceOf(accountAddress).encodeABI();

    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: userRewardDebtAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: balanceOfAbi }, "latest"],
    });

    const [rewardDebtResult, lpAmountResult] = await batch.execute();

    if (rewardDebtResult && lpAmountResult && !rewardDebtResult.error && !lpAmountResult.error) {
      return new UserBalance({
        lpAmount: Web3.utils.toBigInt(lpAmountResult.result).toString(),
        rewardDebt: Web3.utils.toBigInt(rewardDebtResult.result).toString(),
      });
    }
    throw new Error("Batched failed");
  }

  private async getUserBalanceInfoPerProperty(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const rewardDebt = (
      await this.getPoolContract(token.poolAddress).methods.userRewardDebt(accountAddress).call()
    ).toString();
    const lpAmount = (
      await this.getPoolContract(token.poolAddress).methods.balanceOf(accountAddress).call()
    ).toString();
    return new UserBalance({ lpAmount, rewardDebt });
  }

  private async getPoolInfoByBatch(token: TokenWithChainDetails): Promise<PoolInfo> {
    const batch = new this.web3.eth.BatchRequest();
    const poolContract = this.getPoolContract(token.poolAddress);

    const aAbi = poolContract.methods.a().encodeABI();
    const dAbi = poolContract.methods.d().encodeABI();
    const tokenBalanceAbi = poolContract.methods.tokenBalance().encodeABI();
    const vUsdBalanceAbi = poolContract.methods.vUsdBalance().encodeABI();
    const totalSupplyAbi = poolContract.methods.totalSupply().encodeABI();
    const accRewardPerSharePAbi = poolContract.methods.accRewardPerShareP().encodeABI();

    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: aAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: dAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: tokenBalanceAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: vUsdBalanceAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: totalSupplyAbi }, "latest"],
    });
    batch.add({
      method: "eth_call",
      params: [{ to: token.poolAddress, data: accRewardPerSharePAbi }, "latest"],
    });

    const [aResult, dResult, tokenBalanceResult, vUsdBalanceResult, totalSupplyResult, accRewardPerSharePResult] =
      await batch.execute();

    if (
      aResult &&
      dResult &&
      tokenBalanceResult &&
      vUsdBalanceResult &&
      totalSupplyResult &&
      accRewardPerSharePResult &&
      !aResult.error &&
      !dResult.error &&
      !tokenBalanceResult.error &&
      !vUsdBalanceResult.error &&
      !totalSupplyResult.error &&
      !accRewardPerSharePResult.error
    ) {
      const tokenBalanceStr = Web3.utils.toBigInt(tokenBalanceResult.result).toString();
      const vUsdBalanceStr = Web3.utils.toBigInt(vUsdBalanceResult.result).toString();
      const imbalance = calculatePoolInfoImbalance({ tokenBalance: tokenBalanceStr, vUsdBalance: vUsdBalanceStr });
      return {
        aValue: Web3.utils.toBigInt(aResult.result).toString(),
        dValue: Web3.utils.toBigInt(dResult.result).toString(),
        tokenBalance: tokenBalanceStr,
        vUsdBalance: vUsdBalanceStr,
        totalLpAmount: Web3.utils.toBigInt(totalSupplyResult.result).toString(),
        accRewardPerShareP: Web3.utils.toBigInt(accRewardPerSharePResult.result).toString(),
        p: this.P,
        imbalance,
      };
    }
    throw new Error("Batched failed");
  }

  private async getPoolInfoPerProperty(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = this.getPoolContract(token.poolAddress);

    const aValue = (await poolContract.methods.a().call()).toString();
    const dValue = (await poolContract.methods.d().call()).toString();
    const tokenBalance = (await poolContract.methods.tokenBalance().call()).toString();
    const vUsdBalance = (await poolContract.methods.vUsdBalance().call()).toString();
    const totalLpAmount = (await poolContract.methods.totalSupply().call()).toString();
    const accRewardPerShareP = (await poolContract.methods.accRewardPerShareP().call()).toString();

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

  private getPoolContract(contractAddress: string) {
    return new this.web3.eth.Contract(Pool.abi, contractAddress) as Contract<typeof Pool.abi>;
  }
}
