import { AllbridgeCoreClient } from "../../../client/core-api";
import { ChainType } from "../../../chains";
import { RawTransaction } from "../../models";
import { ClassOptions } from "../../models/srb/method-options";
import {
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  PoolInfo,
  SdkError,
  TokenWithChainDetails,
  UserBalanceInfo,
} from "../../../models";
import { ChainPoolService, UserBalance } from "../models";
import { PoolContract } from "../../models/srb/pool";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { Address } from "soroban-client";

export class SrbPoolService extends ChainPoolService {
  chainType: ChainType.SRB = ChainType.SRB;
  private P = 52;

  constructor(public srbRpcUrl: string, public api: AllbridgeCoreClient) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const poolContract = await this.getContract(token.poolAddress);
    const userDeposit = (await poolContract.getUserDeposit({ user: Address.fromString(accountAddress) }))?.unwrap();
    if (!userDeposit) {
      throw new SdkError();
    }
    return new UserBalance({
      lpAmount: userDeposit.lp_amount.toString(),
      rewardDebt: userDeposit.reward_debt.toString(),
    });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = await this.getContract(token.poolAddress);
    const pool = (await poolContract.getPool())?.unwrap();
    if (!pool) {
      throw new SdkError();
    }
    return {
      aValue: pool.a.toString(),
      accRewardPerShareP: pool.acc_reward_per_share_p.toString(),
      dValue: pool.d.toString(),
      tokenBalance: pool.token_balance.toString(),
      p: this.P,
      totalLpAmount: pool.total_lp_amount.toString(),
      vUsdBalance: pool.v_usd_balance.toString(),
      imbalance: calculatePoolInfoImbalance({
        tokenBalance: pool.token_balance.toString(),
        vUsdBalance: pool.v_usd_balance.toString(),
      }),
    };
  }

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const poolContract = await this.getContract(params.token.poolAddress);
    return Promise<undefined>;
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const poolContract = await this.getContract(params.token.poolAddress);
    return Promise<undefined>;
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const poolContract = await this.getContract(params.token.poolAddress);
    return Promise<undefined>;
  }

  private async getContract(address: string): Promise<PoolContract> {
    // const networkPassphrase = await this.network;
    const networkPassphrase = "Test SDF Future Network ; October 2022";
    // const wallet = await this.wallet;
    const wallet = undefined;
    const config: ClassOptions = {
      contractId: address,
      networkPassphrase,
      rpcUrl: this.srbRpcUrl,
      wallet,
    };
    return new PoolContract(config);
  }
}
