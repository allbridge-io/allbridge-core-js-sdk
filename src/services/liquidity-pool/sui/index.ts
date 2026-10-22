import type { SuiClientTypes } from "@mysten/sui/client";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { InvalidAmountError, SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { RawSuiTransaction } from "../../models";
import { phantom } from "../../models/sui/_framework/reified";
import { setAddress } from "../../models/sui/bridge";
import {
  claimReward,
  deposit,
  newUserDeposit,
  pool,
  withdraw,
} from "../../models/sui/bridge/bridge-interface/functions";
import { Pool } from "../../models/sui/bridge/pool/structs";
import { UserDeposit } from "../../models/sui/bridge/user-deposit/structs";
import { createSuiClient, SuiCoin } from "../../utils/sui/client";
import { getCoinsWithAmounts } from "../../utils/sui/coins";
import { fetchAllPagesRecursive } from "../../utils/sui/paginated";
import { suiView } from "../../utils/sui/view";
import {
  ChainPoolService,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
} from "../models";

/**
 * @deprecated Do not use.
 */
export class SuiPoolService extends ChainPoolService {
  chainType: ChainType.SUI = ChainType.SUI;

  private readonly client: SuiGrpcClient;

  constructor(
    public suiRpcUrl: string,
    readonly params: AllbridgeCoreSdkOptions,
    public api: AllbridgeCoreClient
  ) {
    super();
    this.client = createSuiClient(suiRpcUrl, params.suiIsTestnet);
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    if (!token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const suiAddresses = token.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    const typeArg = phantom(token.originTokenAddress);
    const deposits = await this.fetchDeposits(accountAddress, token.originTokenAddress);
    const total = deposits.reduce(
      (total, element) => {
        const userDeposit = UserDeposit.fromCoreObject(typeArg, element);
        total.lpAmount += BigInt(userDeposit.lpAmount);
        total.rewardDebt += BigInt(userDeposit.rewardDebt);
        return total;
      },
      { lpAmount: BigInt(0), rewardDebt: BigInt(0) }
    );
    return new UserBalance({ lpAmount: total.lpAmount.toString(), rewardDebt: total.rewardDebt.toString() });
  }

  private async fetchDeposits(
    accountAddress: string,
    tokenAddress: string
  ): Promise<SuiClientTypes.Object<{ content: true }>[]> {
    return await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.client.core.listOwnedObjects({
        owner: accountAddress,
        type: UserDeposit.phantom(phantom(tokenAddress)).phantomType,
        include: { content: true },
        cursor,
      })
    );
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const suiAddresses = token.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    if (!token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }

    const P = 48;
    const tx = new Transaction();
    pool(tx, token.originTokenAddress, suiAddresses.bridgeObjectAddress);
    const res = await suiView(this.client, tx, Pool.reified(phantom(token.originTokenAddress)));

    const tokenBalance = res.state.tokenBalance;
    const vUsdBalance = res.state.vusdBalance;
    const imbalance = calculatePoolInfoImbalance({ tokenBalance, vUsdBalance });

    return {
      dValue: res.state.d,
      aValue: res.state.a,
      totalLpAmount: res.rewards.lpSupply,
      vUsdBalance: vUsdBalance,
      tokenBalance: tokenBalance,
      accRewardPerShareP: res.rewards.accRewardPerShareP,
      p: P,
      imbalance,
    };
  }

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawSuiTransaction> {
    const suiAddresses = params.token.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const coins: SuiCoin[] = await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.client.core.listCoins({
        owner: params.accountAddress,
        coinType: params.token.originTokenAddress,
        cursor,
      })
    );
    if (coins.length === 0 || !coins[0]) {
      throw new InvalidAmountError("No coins to deposit");
    }
    const firstCoin = coins[0];

    const tx = new Transaction();
    tx.setSender(params.accountAddress);
    const { depositObj, isNewDeposit } = await this.getDepositObject(
      params.accountAddress,
      params.token.originTokenAddress,
      tx
    );
    const [amountCoin] = getCoinsWithAmounts([params.amount], coins, tx);
    if (!amountCoin) {
      throw new InvalidAmountError("No coins to deposit");
    }
    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const rewards = deposit(tx, params.token.originTokenAddress, {
      bridge: suiAddresses.bridgeObjectAddress,
      userDeposit: depositObj,
      coin: amountCoin,
    });
    tx.mergeCoins(firstCoin.objectId, [rewards]);
    if (isNewDeposit) {
      tx.transferObjects([depositObj], params.accountAddress);
    }
    return await tx.toJSON({ client: this.client });
  }

  private async getDepositObject(
    accountAddress: string,
    tokenAddress: string,
    tx: Transaction
  ): Promise<{
    depositObj: string | TransactionResult;
    isNewDeposit: boolean;
  }> {
    const deposits = await this.fetchDeposits(accountAddress, tokenAddress);
    if (deposits.length === 0 || !deposits[0]) {
      const tokenType = phantom(tokenAddress).phantomType;
      const depositObj = newUserDeposit(tx, tokenType);
      return { depositObj, isNewDeposit: true };
    } else {
      return { depositObj: deposits[0].objectId, isNewDeposit: false };
    }
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawSuiTransaction> {
    const suiAddresses = params.token.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const tokenType = phantom(params.token.originTokenAddress).phantomType;

    const tx = new Transaction();
    tx.setSender(params.accountAddress);

    const { depositObj, isNewDeposit } = await this.getDepositObject(
      params.accountAddress,
      params.token.originTokenAddress,
      tx
    );
    if (isNewDeposit) {
      throw new InvalidAmountError("No deposit found");
    }

    const rewards = withdraw(tx, tokenType, {
      bridge: suiAddresses.bridgeObjectAddress,
      userDeposit: depositObj,
      amountLp: BigInt(params.amount),
    });

    const coins: SuiCoin[] = await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.client.core.listCoins({
        owner: params.accountAddress,
        coinType: params.token.originTokenAddress,
        cursor,
      })
    );

    if (!rewards[0] || !rewards[1]) {
      throw new SdkError("No rewards found");
    }

    if (coins[0]) {
      tx.mergeCoins(coins[0].objectId, [rewards[0], rewards[1]]);
    } else {
      tx.mergeCoins(rewards[0], [rewards[1]]);
      tx.transferObjects([rewards[0]], params.accountAddress);
    }
    return await tx.toJSON({ client: this.client });
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawSuiTransaction> {
    const suiAddresses = params.token.suiAddresses;
    if (!suiAddresses) {
      throw new SdkError("SUI token must contain 'suiAddresses'");
    }
    setAddress(suiAddresses.bridgeAddress, suiAddresses.bridgeAddressOrigin);

    if (!params.token.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    const tokenType = phantom(params.token.originTokenAddress).phantomType;

    const tx = new Transaction();
    tx.setSender(params.accountAddress);

    const { depositObj, isNewDeposit } = await this.getDepositObject(
      params.accountAddress,
      params.token.originTokenAddress,
      tx
    );
    if (isNewDeposit) {
      throw new InvalidAmountError("No deposit found");
    }

    const reward = claimReward(tx, tokenType, {
      bridge: suiAddresses.bridgeObjectAddress,
      userDeposit: depositObj,
    });

    const coins: SuiCoin[] = await fetchAllPagesRecursive((cursor: string | null | undefined) =>
      this.client.core.listCoins({
        owner: params.accountAddress,
        coinType: params.token.originTokenAddress,
        cursor,
      })
    );

    if (coins[0]) {
      tx.mergeCoins(coins[0].objectId, [reward]);
    } else {
      tx.transferObjects([reward], params.accountAddress);
    }
    return await tx.toJSON({ client: this.client });
  }
}
