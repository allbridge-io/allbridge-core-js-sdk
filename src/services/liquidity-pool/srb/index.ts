import { contract } from "@stellar/stellar-sdk";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions, ChainSymbol, ChainType } from "../../../index";
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
import { PoolContract } from "../../models/srb/pool-contract";
import { ChainPoolService, UserBalance } from "../models";
import ContractClientOptions = contract.ClientOptions;

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
    const result = (await poolContract.get_user_deposit({ user: accountAddress })).result;
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
    const result = (await poolContract.get_pool()).result;
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
    const poolContract = this.getContract(params.token.poolAddress, params.accountAddress);
    console.log("sender", params.accountAddress);
    console.log("poolAddress", params.token.poolAddress);
    return (
      await poolContract.deposit({
        sender: params.accountAddress,
        amount: BigInt(params.amount),
      })
    ).toXDR();
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress, params.accountAddress);
    return (
      await poolContract.withdraw({
        sender: params.accountAddress,
        amount_lp: BigInt(params.amount),
      })
    ).toXDR();
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const poolContract = this.getContract(params.token.poolAddress, params.accountAddress);
    return (
      await poolContract.claim_rewards({
        sender: params.accountAddress,
      })
    ).toXDR();
  }

  private getContract(address: string, sender?: string): PoolContract {
    const config: ContractClientOptions = {
      publicKey: sender,
      contractId: address,
      networkPassphrase: this.params.sorobanNetworkPassphrase,
      rpcUrl: this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.SRB),
    };
    return new PoolContract(config);
  }
}
