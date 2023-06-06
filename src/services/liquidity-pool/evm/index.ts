import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { RawTransaction } from "../../models";
import abi from "../../models/abi/Pool.json";
import { Pool as PoolContract } from "../../models/abi/types/Pool";
import { BaseContract } from "../../models/abi/types/types";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalanceInfo } from "../models";
import { ChainPoolService } from "../models/pool";

export class EvmPoolService extends ChainPoolService {
  chainType: ChainType.EVM = ChainType.EVM;
  private P = 52;

  constructor(public web3: Web3, public api: AllbridgeCoreClient) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const rewardDebt = await this.getPoolContract(token.poolAddress).methods.userRewardDebt(accountAddress).call();
    const lpAmount = await this.getPoolContract(token.poolAddress).methods.balanceOf(accountAddress).call();
    return new UserBalanceInfo({ lpAmount, rewardDebt });
  }

  async getPoolInfo(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = this.getPoolContract(token.poolAddress);
    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all([
      poolContract.methods.a().call(),
      poolContract.methods.d().call(),
      poolContract.methods.tokenBalance().call(),
      poolContract.methods.vUsdBalance().call(),
      poolContract.methods.totalSupply().call(),
      poolContract.methods.accRewardPerShareP().call(),
    ]);

    return {
      aValue,
      dValue,
      tokenBalance,
      vUsdBalance,
      totalLpAmount,
      accRewardPerShareP,
      p: this.P,
    };
  }

  /* eslint-disable-next-line  @typescript-eslint/require-await */
  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    return {
      ...(await this.buildTxParams(params)),
      data: this.getPoolContract(params.token.poolAddress).methods.deposit(params.amount).encodeABI(),
    };
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    return {
      ...(await this.buildTxParams(params)),
      data: this.getPoolContract(params.token.poolAddress).methods.withdraw(params.amount).encodeABI(),
    };
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    return {
      ...(await this.buildTxParams(params)),
      data: this.getPoolContract(params.token.poolAddress).methods.claimRewards().encodeABI(),
    };
  }

  async buildTxParams(params: LiquidityPoolsParams) {
    const txParams = {
      from: params.accountAddress,
      to: params.token.poolAddress,
      value: "0",
    };

    if (params.token.chainSymbol == ChainSymbol.POL) {
      const gasInfo = await this.api.getPolygonGasInfo();

      return {
        ...txParams,
        maxPriorityFeePerGas: gasInfo.maxPriorityFee,
        maxFeePerGas: gasInfo.maxFee,
      };
    }
    return txParams;
  }

  private getContract<T extends BaseContract>(abiItem: AbiItem[], contractAddress: string): T {
    return new this.web3.eth.Contract(abiItem, contractAddress) as any;
  }

  private getPoolContract(contractAddress: string): PoolContract {
    return this.getContract<PoolContract>(abi as AbiItem[], contractAddress);
  }
}
