import { ClarigenClient, contractFactory } from "@clarigen/core";
import { createNetwork } from "@stacks/network";
import {
  makeRandomPrivKey,
  makeUnsignedContractCall,
  PostConditionMode,
  privateKeyToPublic,
} from "@stacks/transactions";
import { Big } from "big.js";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance, fromSystemPrecision } from "../../../utils/calculation";
import { RawStxTransaction } from "../../models";
import { stacksContracts as contracts } from "../../models/stx/clarigen-types";
import { getTokenName } from "../../utils/stx/get-token-name";
import { getFungiblePostCondition } from "../../utils/stx/post-conditions";
import {
  ChainPoolService,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
} from "../models";

export class StxPoolService extends ChainPoolService {
  chainType: ChainType.STX = ChainType.STX;

  private P = 48;
  private A = "20";
  private client: ClarigenClient;

  constructor(
    public nodeRpcUrl: string,
    public params: AllbridgeCoreSdkOptions,
    public api: AllbridgeCoreClient
  ) {
    super();
    const network = createNetwork({
      network: this.params.stxIsTestnet ? "testnet" : "mainnet",
      client: { baseUrl: this.nodeRpcUrl },
      apiKey: this.params.stxHeroApiKey,
    });
    this.client = new ClarigenClient(network, this.params.stxHeroApiKey);
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const pool = contractFactory(contracts.pool, token.poolAddress);

    const lpAmount = await this.client.ro(pool.getLpBalance({ user: accountAddress }));
    const rewardDebt = await this.client.ro(pool.getUserRewardDebt({ user: accountAddress }));

    return new UserBalance({ lpAmount: lpAmount.toString(), rewardDebt: rewardDebt.toString() });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const pool = contractFactory(contracts.pool, token.poolAddress);

    const [dValueRaw, tokenBalanceRaw, vUsdBalanceRaw, totalLpAmountRaw, accRewardPerSharePRaw] = await Promise.all([
      this.client.ro(pool.getD()),
      this.client.ro(pool.getTokenBalance()),
      this.client.ro(pool.getVusdBalance()),
      this.client.ro(pool.getLpTotalSupply()),
      this.client.ro(pool.getAccRewardPerShareP()),
    ]);

    const dValue = dValueRaw.toString();
    const tokenBalance = tokenBalanceRaw.toString();
    const vUsdBalance = vUsdBalanceRaw.toString();
    const totalLpAmount = totalLpAmountRaw.toString();
    const accRewardPerShareP = accRewardPerSharePRaw.toString();
    if (dValue && tokenBalance && vUsdBalance && totalLpAmount && accRewardPerShareP) {
      const imbalance = calculatePoolInfoImbalance({ tokenBalance, vUsdBalance });
      return {
        aValue: this.A,
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

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawStxTransaction> {
    const pool = contractFactory(contracts.pool, params.token.poolAddress);

    const { contractAddress, contractName, functionName, functionArgs } = pool.deposit({
      amount: BigInt(params.amount),
      ftRef: params.token.tokenAddress,
    });

    const privateKey = makeRandomPrivKey();
    const publicKey = privateKeyToPublic(privateKey);

    const userPostFungibleCondition = getFungiblePostCondition(
      params.amount,
      "lte",
      params.accountAddress,
      params.token.tokenAddress,
      getTokenName(params.token)
    );

    const claimRewardsPostFungibleCondition = getFungiblePostCondition(
      0,
      "gte",
      params.token.poolAddress,
      params.token.tokenAddress,
      getTokenName(params.token)
    );

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      publicKey,
      validateWithAbi: true,
      network: this.client.network,
      postConditions: [userPostFungibleCondition, claimRewardsPostFungibleCondition],
      postConditionMode: PostConditionMode.Deny,
    };
    const transaction = await makeUnsignedContractCall(txOptions);
    return transaction.serialize();
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawStxTransaction> {
    const pool = contractFactory(contracts.pool, params.token.poolAddress);

    const { contractAddress, contractName, functionName, functionArgs } = pool.withdraw({
      amountLp: BigInt(params.amount),
      ftRef: params.token.tokenAddress,
    });

    const privateKey = makeRandomPrivKey();
    const publicKey = privateKeyToPublic(privateKey);

    const poolPostFungibleCondition = getFungiblePostCondition(
      fromSystemPrecision(params.amount, params.token.decimals).toFixed(0, Big.roundDown),
      "gte",
      params.token.poolAddress,
      params.token.tokenAddress,
      getTokenName(params.token)
    );
    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      publicKey,
      validateWithAbi: true,
      network: this.client.network,
      postConditions: [poolPostFungibleCondition],
      postConditionMode: PostConditionMode.Deny,
    };
    const transaction = await makeUnsignedContractCall(txOptions);
    return transaction.serialize();
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawStxTransaction> {
    const pool = contractFactory(contracts.pool, params.token.poolAddress);

    const { contractAddress, contractName, functionName, functionArgs } = pool.claimRewards({
      ftRef: params.token.tokenAddress,
    });

    const privateKey = makeRandomPrivKey();
    const publicKey = privateKeyToPublic(privateKey);

    const poolPostFungibleCondition = getFungiblePostCondition(
      0,
      "gte",
      params.token.poolAddress,
      params.token.tokenAddress,
      getTokenName(params.token)
    );
    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      publicKey,
      validateWithAbi: true,
      network: this.client.network,
      postConditions: [poolPostFungibleCondition],
      postConditionMode: PostConditionMode.Deny,
    };
    const transaction = await makeUnsignedContractCall(txOptions);
    return transaction.serialize();
  }
}
