import { TronWeb } from "tronweb";
import { AbiItem, Web3 } from "web3";
import { encodeFunctionCall } from "web3-eth-abi";
import { AbiFunctionFragment } from "web3-types";
import { ChainType } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { SdkError } from "../../../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../../../tokens-info";
import { calculatePoolInfoImbalance } from "../../../utils/calculation";
import { tronAddressToEthAddress } from "../../bridge/utils";
import { RawTransaction, SmartContractMethodParameter } from "../../models";
import Pool from "../../models/abi/Pool";
import {
  ChainPoolService,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
  UserBalance,
  UserBalanceInfo,
} from "../models";

export class TronPoolService extends ChainPoolService {
  chainType: ChainType.TRX = ChainType.TRX;
  private P = 52;

  constructor(
    public tronWeb: TronWeb,
    public api: AllbridgeCoreClient,
    private readonly tronJsonRpc: string | undefined
  ) {
    super();
  }

  async getUserBalanceInfo(accountAddress: string, token: TokenWithChainDetails): Promise<UserBalanceInfo> {
    let userBalanceInfo;
    if (this.tronJsonRpc) {
      try {
        userBalanceInfo = await this.getUserBalanceInfoByBatch(this.tronJsonRpc, accountAddress, token);
      } catch (ignoreError) {
        userBalanceInfo = await this.getUserBalanceInfoPerProperty(accountAddress, token);
      }
    } else {
      userBalanceInfo = await this.getUserBalanceInfoPerProperty(accountAddress, token);
    }
    return userBalanceInfo;
  }

  private async getUserBalanceInfoByBatch(
    tronJsonRpc: string,
    accountAddress: string,
    token: TokenWithChainDetails
  ): Promise<UserBalanceInfo> {
    const contractAddress = await tronAddressToEthAddress(token.poolAddress);
    const userAddress = await tronAddressToEthAddress(accountAddress);

    const payload = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("userRewardDebt", userAddress) }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("balanceOf", userAddress) }, "latest"],
      },
    ];

    const response = await fetch(tronJsonRpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const results = await response.json();

    if (Array.isArray(results) && results.length === 2) {
      const getResult = (id: number) => {
        const entry = results.find((r) => r.id === id);
        if (!entry || !entry.result) {
          throw new Error(`Missing or invalid result for id ${id}`);
        }
        return Web3.utils.toBigInt(entry.result).toString();
      };

      return new UserBalance({
        lpAmount: Web3.utils.toBigInt(getResult(2)).toString(),
        rewardDebt: Web3.utils.toBigInt(getResult(1)).toString(),
      });
    }

    throw new Error("Batched HTTP call failed");
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
    if (this.tronJsonRpc) {
      try {
        poolInfo = await this.getPoolInfoByBatch(this.tronJsonRpc, token);
      } catch (ignoreError) {
        poolInfo = await this.getPoolInfoPerProperty(token);
      }
    } else {
      poolInfo = await this.getPoolInfoPerProperty(token);
    }
    return poolInfo;
  }

  private async getPoolInfoByBatch(tronJsonRpc: string, token: TokenWithChainDetails): Promise<PoolInfo> {
    const contractAddress = await tronAddressToEthAddress(token.poolAddress);

    const payload = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("a") }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("d") }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 3,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("tokenBalance") }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 4,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("vUsdBalance") }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 5,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("totalSupply") }, "latest"],
      },
      {
        jsonrpc: "2.0",
        id: 6,
        method: "eth_call",
        params: [{ to: contractAddress, data: this.getFunctionAbi("accRewardPerShareP") }, "latest"],
      },
    ];

    const response = await fetch(tronJsonRpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const results = await response.json();

    if (Array.isArray(results) && results.length === 6) {
      const getResult = (id: number) => {
        const entry = results.find((r) => r.id === id);
        if (!entry || !entry.result) {
          throw new Error(`Missing or invalid result for id ${id}`);
        }
        return Web3.utils.toBigInt(entry.result).toString();
      };

      const tokenBalanceStr = getResult(3);
      const vUsdBalanceStr = getResult(4);
      const imbalance = calculatePoolInfoImbalance({ tokenBalance: tokenBalanceStr, vUsdBalance: vUsdBalanceStr });

      return {
        aValue: getResult(1),
        dValue: getResult(2),
        tokenBalance: tokenBalanceStr,
        vUsdBalance: vUsdBalanceStr,
        totalLpAmount: getResult(5),
        accRewardPerShareP: getResult(6),
        p: this.P,
        imbalance,
      };
    }

    throw new Error("Batched pool info call failed");
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

  private getFunctionAbi(name: string, ...params: string[]): string {
    const abiItem = (Pool.abi as ReadonlyArray<AbiItem>).find(
      (item) => item.type === "function" && "name" in item && item.name === name
    );

    if (!abiItem) {
      throw new Error(`${name} method not found in Pool ABI`);
    }

    return encodeFunctionCall(abiItem as AbiFunctionFragment, params);
  }
}
