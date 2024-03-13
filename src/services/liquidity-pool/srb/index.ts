import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { AllbridgeCoreSdkOptions } from "../../../index";
import {
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  PoolInfo,
  SdkError,
  TokenWithChainDetails,
  UserBalanceInfo,
} from "../../../models";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { NodeRpcUrlsConfig } from "../../index";
import { RawTransaction } from "../../models";
import { PoolContract } from "../../models/srb/pool";
import { ClassOptions } from "../../utils/srb/method-options";
import { ChainPoolService, UserBalance } from "../models";

export class SrbPoolService extends ChainPoolService {
  chainType: ChainType.SRB = ChainType.SRB;
  private P = 48;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    readonly params: AllbridgeCoreSdkOptions,
    readonly api: AllbridgeCoreClient
  ) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const poolContract = this.getContract(token.poolAddress);
    const result = (await poolContract.getUserDeposit({ user: accountAddress })).result;
    if (result.isErr()) {
      throw new SdkError();
    }
    const userDeposit = result.unwrap();
    return new UserBalance({
      lpAmount: userDeposit.lp_amount.toString(),
      rewardDebt: userDeposit.reward_debt.toString(),
    });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = this.getContract(token.poolAddress);
    const result = (await poolContract.getPool()).result;
    if (result.isErr()) {
      throw new SdkError();
    }
    const pool = result.unwrap();
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
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.depositXdr({
      sender: params.accountAddress,
      amount: BigInt(params.amount),
    });
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.withdrawXdr({
      sender: params.accountAddress,
      amount_lp: BigInt(params.amount),
    });
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.claimRewardsXdr({
      sender: params.accountAddress,
    });
  }

  private getContract(address: string): PoolContract {
    const config: ClassOptions = {
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new PoolContract(config);
  }
}
