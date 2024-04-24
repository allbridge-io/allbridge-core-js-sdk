// @ts-expect-error import tron
import TronWeb from "tronweb";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { SdkError } from "../../../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { tronAddressToEthAddress } from "../../bridge/utils";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import PoolAbi from "../../models/abi/Pool.json";
import { promisify } from "../../utils";
import { LiquidityPoolsParams, LiquidityPoolsParamsWithAmount, UserBalance, UserBalanceInfo } from "../models";
import { ChainPoolService } from "../models/pool";

export class TronPoolService extends ChainPoolService {
  chainType: ChainType.TRX = ChainType.TRX;
  private static contracts = new Map<string, any>();
  private P = 52;
  private web3: Web3;

  constructor(public tronWeb: typeof TronWeb, public api: AllbridgeCoreClient, tronRpcUrl: string) {
    super();
    this.web3 = new Web3(tronRpcUrl + "/jsonrpc");
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    let userBalanceInfo;
    try {
      userBalanceInfo = await this.getUserBalanceInfoByBatch(accountAddress, token);
    } catch (err) {
      userBalanceInfo = await this.getUserBalanceInfoPerProperty(accountAddress, token);
    }
    return userBalanceInfo;
  }

  private async getUserBalanceInfoByBatch(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const batch = new this.web3.BatchRequest();
    const contract = new this.web3.eth.Contract(PoolAbi as AbiItem[], tronAddressToEthAddress(token.poolAddress));
    const userAccount = tronAddressToEthAddress(accountAddress);
    const arr = ["userRewardDebt", "balanceOf"].map((methodName) =>
      promisify((cb: any) => batch.add(contract.methods[methodName](userAccount).call.request({}, cb)))()
    );
    batch.execute();
    const [rewardDebt, lpAmount] = await Promise.all(arr);
    return new UserBalance({ lpAmount, rewardDebt });
  }

  private async getUserBalanceInfoPerProperty(
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const contract = await this.getContract(token.poolAddress);
    const rewardDebt = (await contract.methods.userRewardDebt(accountAddress).call()).toString();
    const lpAmount = (await contract.methods.balanceOf(accountAddress).call()).toString();
    return new UserBalance({ lpAmount, rewardDebt });
  }

  async getPoolInfoFromChain(token: TokenWithChainDetails): Promise<PoolInfo> {
    let poolInfo;
    try {
      poolInfo = await this.getPoolInfoByBatch(token);
    } catch (err) {
      poolInfo = await this.getPoolInfoPerProperty(token);
    }
    return poolInfo;
  }

  private async getPoolInfoByBatch(token: TokenWithChainDetails): Promise<PoolInfo> {
    const batch = new this.web3.BatchRequest();
    const contract = new this.web3.eth.Contract(PoolAbi as AbiItem[], tronAddressToEthAddress(token.poolAddress));
    const arr = ["a", "d", "tokenBalance", "vUsdBalance", "totalSupply", "accRewardPerShareP"].map((methodName) =>
      promisify((cb: any) => batch.add(contract.methods[methodName]().call.request({}, cb)))()
    );
    batch.execute();

    const [aValue, dValue, tokenBalance, vUsdBalance, totalLpAmount, accRewardPerShareP] = await Promise.all(arr);
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

  private async getPoolInfoPerProperty(token: TokenWithChainDetails): Promise<PoolInfo> {
    const poolContract = await this.getContract(token.poolAddress);
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
        callValue: value,
      },
      parameter,
      fromAddress
    );
    if (!transactionObject?.result?.result) {
      throw new SdkError("Unknown error: " + JSON.stringify(transactionObject, null, 2));
    }
    return transactionObject.transaction;
  }

  private async getContract(contractAddress: string): Promise<any> {
    if (TronPoolService.contracts.has(contractAddress)) {
      return TronPoolService.contracts.get(contractAddress);
    }
    const contract = await this.tronWeb.contract().at(contractAddress);
    TronPoolService.contracts.set(contractAddress, contract);
    return contract;
  }
}
