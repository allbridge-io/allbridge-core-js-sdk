import { AnchorProvider, BN, Program, Provider, Spl, web3 } from "@project-serum/anchor";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { RawTransaction } from "../../models";
import { Bridge as BridgeType, IDL as bridgeIdl } from "../../models/sol/types/bridge";
import { getTokenAccountData } from "../../utils/sol";
import {
  getAssociatedAccount,
  getAuthorityAccount,
  getBridgeTokenAccount,
  getConfigAccount,
  getUserDepositAccount,
} from "../../utils/sol/accounts";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalance, UserBalanceInfo } from "../models";
import { ChainPoolService } from "../models/pool";

interface LPAccounts {
  mint: PublicKey;
  user: PublicKey;
  config: PublicKey;
  pool: PublicKey;
  bridgeAuthority: PublicKey;
  userDeposit: PublicKey;
  userToken: PublicKey;
  bridgeToken: PublicKey;
}

interface LPTransactionData {
  accounts: LPAccounts;
  preInstructions: TransactionInstruction[];
}

export class SolanaPoolService extends ChainPoolService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;
  private P = 48;

  constructor(public solanaRpcUrl: string, public api: AllbridgeCoreClient) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    const provider = this.buildAnchorProvider(accountAddress);
    const bridge = this.getBridge(token.bridgeAddress, provider);
    const poolAccount = new PublicKey(token.poolAddress);
    const poolAccountInfo = await bridge.account.pool.fetch(poolAccount);
    try {
      const userDepositAccount = await getUserDepositAccount(
        new PublicKey(accountAddress),
        poolAccountInfo.mint,
        bridge.programId
      );
      const { lpAmount, rewardDebt } = await bridge.account.userDeposit.fetch(userDepositAccount);
      return new UserBalance({
        lpAmount: lpAmount.toString(),
        rewardDebt: rewardDebt.toString(),
      });
    } catch (e) {
      return new UserBalance({ lpAmount: "0", rewardDebt: "0" });
    }
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    const provider = this.buildAnchorProvider(token.bridgeAddress);
    const pool = await this.getBridge(token.bridgeAddress, provider).account.pool.fetch(token.poolAddress);
    const vUsdBalance = pool.vUsdBalance.toString();
    const tokenBalance = pool.tokenBalance.toString();
    const imbalance = calculatePoolInfoImbalance({ tokenBalance, vUsdBalance });
    return {
      dValue: pool.d.toString(),
      aValue: pool.a.toString(),
      totalLpAmount: pool.totalLpAmount.toString(),
      vUsdBalance,
      tokenBalance,
      accRewardPerShareP: pool.accRewardPerShareP.toString(),
      p: this.P,
      imbalance,
    };
  }

  async buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { bridge, accounts, preInstructions } = await this.prepareDataForTransaction(params);

    const tx = await bridge.methods
      .deposit(new BN(params.amount))
      .accounts(accounts)
      .preInstructions(preInstructions)
      .transaction();
    tx.recentBlockhash = (
      await this.buildAnchorProvider(params.accountAddress).connection.getLatestBlockhash()
    ).blockhash;
    tx.feePayer = new PublicKey(params.accountAddress);
    return tx;
  }

  async buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { bridge, accounts, preInstructions } = await this.prepareDataForTransaction(params);

    const tx = await bridge.methods
      .withdraw(new BN(params.amount))
      .accounts(accounts)
      .preInstructions(preInstructions)
      .transaction();
    tx.recentBlockhash = (
      await this.buildAnchorProvider(params.accountAddress).connection.getLatestBlockhash()
    ).blockhash;
    tx.feePayer = new PublicKey(params.accountAddress);
    return tx;
  }

  async buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const { bridge, accounts, preInstructions } = await this.prepareDataForTransaction(params);

    const tx = await bridge.methods.claimRewards().accounts(accounts).preInstructions(preInstructions).transaction();
    tx.recentBlockhash = (
      await this.buildAnchorProvider(params.accountAddress).connection.getLatestBlockhash()
    ).blockhash;
    tx.feePayer = new PublicKey(params.accountAddress);
    return tx;
  }

  private async prepareDataForTransaction(params: LiquidityPoolsParams) {
    const provider = this.buildAnchorProvider(params.accountAddress);
    const bridge = this.getBridge(params.token.bridgeAddress, provider);

    const { accounts, preInstructions } = await this._getLPTransactionData(
      bridge,
      params.token.poolAddress,
      params.accountAddress,
      provider
    );
    return { bridge, accounts, preInstructions };
  }

  private getBridge(bridgeAddress: string, provider: Provider): Program<BridgeType> {
    return new Program<BridgeType>(bridgeIdl, bridgeAddress, provider);
  }

  private buildAnchorProvider(accountAddress: string): Provider {
    const connection = new Connection(this.solanaRpcUrl, "confirmed");

    const publicKey = new PublicKey(accountAddress);

    return new AnchorProvider(
      connection,
      // @ts-expect-error enough wallet for fetch actions
      { publicKey: publicKey },
      {
        preflightCommitment: "processed",
        commitment: "finalized",
      }
    );
  }

  private async _getLPTransactionData(
    bridge: Program<BridgeType>,
    poolAddress: string,
    account: string,
    provider: Provider
  ): Promise<LPTransactionData> {
    const user = new PublicKey(account);
    const configAccount = await getConfigAccount(bridge.programId);
    const bridgeAuthority = await getAuthorityAccount(bridge.programId);
    const poolAccount = new PublicKey(poolAddress);
    const poolAccountInfo = await bridge.account.pool.fetch(poolAccount);
    const tokenMintAccount = poolAccountInfo.mint;
    const userToken = await getAssociatedAccount(user, tokenMintAccount);
    const bridgeTokenAccount = await getBridgeTokenAccount(tokenMintAccount, bridge.programId);
    const userDepositAccount = await getUserDepositAccount(user, tokenMintAccount, bridge.programId);

    const preInstructions: TransactionInstruction[] = [
      web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
      }),
    ];

    try {
      await getTokenAccountData(userToken, provider);
    } catch (e) {
      const associatedProgram = Spl.associatedToken(provider);
      const createUserTokenInstruction: TransactionInstruction = await associatedProgram.methods
        .create()
        .accounts({
          mint: tokenMintAccount,
          owner: user,
          associatedAccount: userToken,
        })
        .instruction();
      preInstructions.push(createUserTokenInstruction);
    }

    try {
      await bridge.account.userDeposit.fetch(userDepositAccount);
    } catch (error) {
      const instruction: TransactionInstruction = await bridge.methods
        .initDepositAccount()
        .accounts({
          mint: tokenMintAccount,
          user,
          userDeposit: userDepositAccount,
        })
        .instruction();
      preInstructions.push(instruction);
    }

    const accounts: LPAccounts = {
      mint: tokenMintAccount,
      user,
      config: configAccount,
      pool: poolAccount,
      bridgeAuthority: bridgeAuthority,
      userDeposit: userDepositAccount,
      userToken,
      bridgeToken: bridgeTokenAccount,
    };

    return { accounts, preInstructions };
  }
}
