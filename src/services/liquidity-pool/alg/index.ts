import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { assignGroupID, bytesToBigInt } from "algosdk";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { RawTransaction } from "../../models";
import { PoolClient } from "../../models/alg/PoolClient";
import { addBudgetNoops, checkAppOptIn, encodeTxs, feeForInner } from "../../utils/alg";
import {
  ChainPoolService,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
} from "../models";

export class AlgPoolService extends ChainPoolService {
  chainType: ChainType.ALG = ChainType.ALG;
  private P = 48;

  constructor(
    public algorand: AlgorandClient,
    public api: AllbridgeCoreClient
  ) {
    super();
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const userAccount = params.accountAddress;
    const assetId = BigInt(params.token.tokenAddress);
    const poolId = BigInt(params.token.poolAddress);
    const pool = this.getPool(poolId);

    const composer = this.algorand.newGroup();
    composer.addAppCallMethodCall(
      await pool.params.claimRewards({
        args: [],
        sender: userAccount,
        extraFee: feeForInner(1),
        assetReferences: [assetId],
      })
    );
    let { transactions } = await composer.buildTransactions();
    transactions = assignGroupID(transactions);
    return encodeTxs(...transactions);
  }

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const userAccount = params.accountAddress;
    const amount = BigInt(params.amount);
    const assetId = BigInt(params.token.tokenAddress);
    const poolId = BigInt(params.token.poolAddress);
    const pool = this.getPool(poolId);

    const isOptedIn = await checkAppOptIn(poolId, userAccount, this.algorand);

    const composer = this.algorand.newGroup();

    if (!isOptedIn) {
      composer.addAppCallMethodCall(await pool.params.optIn.optInToApplication({ args: [], sender: userAccount }));
    }

    composer.addAssetTransfer({
      assetId: assetId,
      amount: amount,
      sender: userAccount,
      receiver: pool.appAddress,
    });
    composer.addAppCallMethodCall(
      await pool.params.deposit({ args: [], sender: userAccount, extraFee: feeForInner(1) })
    );
    addBudgetNoops({
      composer,
      appId: poolId,
      sender: userAccount,
      count: 4,
    });
    let { transactions } = await composer.buildTransactions();
    transactions = assignGroupID(transactions);
    return encodeTxs(...transactions);
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const userAccount = params.accountAddress;
    const amount = BigInt(params.amount);
    const assetId = BigInt(params.token.tokenAddress);
    const poolId = BigInt(params.token.poolAddress);
    const pool = this.getPool(poolId);

    const composer = this.algorand.newGroup();
    composer.addAppCallMethodCall(
      await pool.params.withdraw({
        args: { amountLp: amount },
        sender: userAccount,
        extraFee: feeForInner(2),
        assetReferences: [assetId],
      })
    );
    addBudgetNoops({
      composer,
      appId: poolId,
      sender: userAccount,
      count: 4,
    });
    let { transactions } = await composer.buildTransactions();
    transactions = assignGroupID(transactions);
    return encodeTxs(...transactions);
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const pool = this.getPool(BigInt(token.poolAddress));
    const all = await pool.state.global.getAll();
    const aValue = all.a?.toString();
    const dValue = all.d?.toString();
    const tokenBalance = all.tokenBalance?.toString();
    const vUsdBalance = all.vUsdBalance?.toString();
    const totalLpAmount = all.totalSupply?.toString();
    const accRewardPerShareP = bytesToBigInt(all.accRewardPerShareP?.asByteArray() ?? Uint8Array.from([])).toString();
    if (aValue && dValue && tokenBalance && vUsdBalance && totalLpAmount && accRewardPerShareP) {
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
    throw new SdkError("Unable to pool info from chain");
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const appId = BigInt(token.poolAddress);
    const pool = this.getPool(appId);
    try {
      const { balance, userRewardDebt } = await pool.state.local(accountAddress).getAll();
      if (balance !== undefined && userRewardDebt !== undefined) {
        return new UserBalance({
          lpAmount: balance.toString(),
          rewardDebt: userRewardDebt.toString(),
        });
      }
    } catch (ignoreError) {
      const info = await this.algorand.account.getInformation(accountAddress);
      const localStates = info.appsLocalState;
      if (localStates) {
        const isOptedIn = localStates.find(({ id: id }) => id === appId);
        if (!isOptedIn) {
          return new UserBalance({ lpAmount: "0", rewardDebt: "0" });
        }
      }
    }
    throw new SdkError("Unable to get user balance");
  }

  private getPool(appId: bigint): PoolClient {
    return this.algorand.client.getTypedAppClientById(PoolClient, { appId });
  }
}
