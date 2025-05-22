import { TronWeb } from "tronweb";
import { Web3 } from "web3";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { tronAddressToEthAddress } from "../../bridge/utils";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import Pool from "../../models/abi/Pool";
import {
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
  ChainPoolService,
} from "../models";

export class TronPoolService extends ChainPoolService {
  chainType: ChainType.TRX = ChainType.TRX;
  private P = 52;
  private web3: Web3 | undefined;

  constructor(
    public tronWeb: TronWeb,
    public api: AllbridgeCoreClient,
    tronJsonRpc: string | undefined
  ) {
    super();
    if (tronJsonRpc) {
      this.web3 = new Web3(tronJsonRpc);
    }
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    let userBalanceInfo;
    if (this.web3) {
      try {
        userBalanceInfo = await this.getUserBalanceInfoByBatch(this.web3, accountAddress, token);
      } catch (ignoreError) {
        userBalanceInfo = await this.getUserBalanceInfoPerProperty(accountAddress, token);
      }
    } else {
      userBalanceInfo = await this.getUserBalanceInfoPerProperty(accountAddress, token);
    }
    return userBalanceInfo;
  }

  private async getUserBalanceInfoByBatch(
    web3: Web3,
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const batch = new web3.BatchRequest();
    const contract = new web3.eth.Contract(Pool.abi, await tronAddressToEthAddress(token.poolAddress));

    const userRewardDebtAbi = contract.methods.userRewardDebt(accountAddress).encodeABI();
    const balanceOfAbi = contract.methods.balanceOf(accountAddress).encodeABI();

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
    if (!this.tronWeb.defaultAddress.base58) {
      this.tronWeb.setAddress(accountAddress);
    }
    const contract = this.getContract(token.poolAddress);
    const rewardDebt = (await contract.methods.userRewardDebt(accountAddress).call()).toString();
    const lpAmount = (await contract.methods.balanceOf(accountAddress).call()).toString();
    return new UserBalance({ lpAmount, rewardDebt });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    let poolInfo;
    if (this.web3) {
      try {
        poolInfo = await this.getPoolInfoByBatch(this.web3, token);
      } catch (ignoreError) {
        poolInfo = await this.getPoolInfoPerProperty(token);
      }
    } else {
      poolInfo = await this.getPoolInfoPerProperty(token);
    }
    return poolInfo;
  }

  private async getPoolInfoByBatch(web3: Web3, token: TokenWithChainDetails): Promise<PoolInfo> {
    const batch = new web3.BatchRequest();
    const contract = new web3.eth.Contract(Pool.abi, await tronAddressToEthAddress(token.poolAddress), this.web3);

    const aAbi = contract.methods.a().encodeABI();
    const dAbi = contract.methods.d().encodeABI();
    const tokenBalanceAbi = contract.methods.tokenBalance().encodeABI();
    const vUsdBalanceAbi = contract.methods.vUsdBalance().encodeABI();
    const totalSupplyAbi = contract.methods.totalSupply().encodeABI();
    const accRewardPerSharePAbi = contract.methods.accRewardPerShareP().encodeABI();

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
    if (!this.tronWeb.defaultAddress.base58) {
      this.tronWeb.setAddress(token.poolAddress);
    }
    const poolContract = this.getContract(token.poolAddress);
    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all([
      poolContract.methods.a().call(),
      poolContract.methods.d().call(),
      poolContract.methods.tokenBalance().call(),
      poolContract.methods.vUsdBalance().call(),
      poolContract.methods.totalSupply().call(),
      poolContract.methods.accRewardPerShareP().call(),
    ]);
    const tokenBalanceStr = tokenBalance.toString();
    const vUsdBalanceStr = vUsdBalance.toString();
    const imbalance = calculatePoolInfoImbalance({ tokenBalance: tokenBalanceStr, vUsdBalance: vUsdBalanceStr });
    return {
      aValue: aValue.toString(),
      dValue: dValue.toString(),
      tokenBalance: tokenBalanceStr,
      vUsdBalance: vUsdBalanceStr,
      totalLpAmount: totalLpAmount.toString(),
      accRewardPerShareP: accRewardPerShareP.toString(),
      p: this.P,
      imbalance,
    };
  }

  buildRawTransactionDeposit(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { amount, accountAddress } = params;

    const parameter = [{ type: "uint256", value: amount }];
    const methodSignature = "deposit(uint256)";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
  }

  buildRawTransactionWithdraw(params: LiquidityPoolsParamsWithAmount): Promise<RawTransaction> {
    const { amount, accountAddress } = params;

    const parameter = [{ type: "uint256", value: amount }];
    const methodSignature = "withdraw(uint256)";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
  }

  buildRawTransactionClaimRewards(params: LiquidityPoolsParams): Promise<RawTransaction> {
    const { accountAddress } = params;

    const parameter: SmartContractMethodParameter[] = [];
    const methodSignature = "claimRewards()";

    return this.buildRawTransaction(params.token.poolAddress, methodSignature, parameter, "0", accountAddress);
  }

  private async buildRawTransaction(
    contractAddress: string,
    methodSignature: string,
    parameter: SmartContractMethodParameter[],
    value: string,
    fromAddress: string
  ): Promise<RawTransaction> {
    const transactionObject = await this.tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      methodSignature,
      {
        callValue: +value,
      },
      parameter,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw new SdkError("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private getContract(contractAddress: string): any {
    return this.tronWeb.contract(Pool.abi, contractAddress);
  }
}
