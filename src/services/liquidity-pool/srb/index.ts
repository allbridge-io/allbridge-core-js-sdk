import { Address } from "soroban-client";
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
import { ClassOptions } from "../../models/srb/method-options";
import { PoolContract } from "../../models/srb/pool";
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
    const poolContract = this.getContract(token.poolAddress);
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
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.deposit({
      sender: Address.fromString(params.accountAddress),
      amount: BigInt(params.amount),
    });
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.withdraw({
      sender: Address.fromString(params.accountAddress),
      amount_lp: BigInt(params.amount),
    });
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress);
    return await poolContract.claimRewards({
      sender: Address.fromString(params.accountAddress),
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
