import { AllbridgeCoreSdkOptions } from "../../index";
import {
  ChainDetailsMap,
  PoolInfo,
  PoolKeyObject,
  TokenWithChainDetails,
  TokenWithChainDetailsWithFlags,
} from "../../tokens-info";
import {
  GasBalanceResponse,
  PendingInfoResponse,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
  TransferStatusResponse,
} from "./core-api.model";
import { AllbridgeCoreClient, AllbridgeCoreClientWithTokens } from "./core-client-base";
import { AllbridgeCoreClientPoolsExt } from "./core-client-pool-info-caching";

export interface AllbridgeCoreClientFiltered extends AllbridgeCoreClient, AllbridgeCoreClientPoolsExt {
  getChainDetailsMap(type: "swap" | "pool"): Promise<ChainDetailsMap>;

  tokens(type: "swap" | "pool"): Promise<TokenWithChainDetails[]>;
}

export class AllbridgeCoreClientFilteredImpl implements AllbridgeCoreClientFiltered {
  private readonly isStaging: boolean;

  constructor(
    private client: AllbridgeCoreClientWithTokens & AllbridgeCoreClientPoolsExt,
    params: AllbridgeCoreSdkOptions,
  ) {
    this.isStaging = params.coreApiQueryParams?.staging === "true";
  }

  async getChainDetailsMap(type: "swap" | "pool"): Promise<ChainDetailsMap> {
    const chainDetailsMapWithFlags = await this.client.getChainDetailsMap();
    const result: ChainDetailsMap = {};

    for (const key in chainDetailsMapWithFlags) {
      const chainDetailsWithTokensWithFlag = chainDetailsMapWithFlags[key];
      if (chainDetailsWithTokensWithFlag) {
        result[key] = {
          ...chainDetailsWithTokensWithFlag,
          tokens: filterAndConvertToTokenWithChainDetails(chainDetailsWithTokensWithFlag.tokens, type, this.isStaging),
        };
      }
    }
    return result;
  }

  async tokens(type: "swap" | "pool"): Promise<TokenWithChainDetails[]> {
    return filterAndConvertToTokenWithChainDetails(await this.client.tokens(), type, this.isStaging);
  }

  async getPendingInfo(): Promise<PendingInfoResponse> {
    return this.client.getPendingInfo();
  }

  async getGasBalance(chainSymbol: string, address: string): Promise<GasBalanceResponse> {
    return this.client.getGasBalance(chainSymbol, address);
  }

  async getTransferStatus(chainSymbol: string, txId: string): Promise<TransferStatusResponse> {
    return await this.client.getTransferStatus(chainSymbol, txId);
  }

  async getReceiveTransactionCost(args: ReceiveTransactionCostRequest): Promise<ReceiveTransactionCostResponse> {
    return await this.client.getReceiveTransactionCost(args);
  }

  cachePut(poolKeyObject: PoolKeyObject, poolInfo: PoolInfo): void {
    return this.client.cachePut(poolKeyObject, poolInfo);
  }

  getPoolInfoByKey(poolKeyObject: PoolKeyObject): Promise<PoolInfo> {
    return this.client.getPoolInfoByKey(poolKeyObject);
  }

  refreshPoolInfo(poolKeyObjects?: PoolKeyObject | PoolKeyObject[]): Promise<void> {
    return this.client.refreshPoolInfo(poolKeyObjects);
  }
}

function filterAndConvertToTokenWithChainDetails(
  tokens: TokenWithChainDetailsWithFlags[],
  type: "swap" | "pool",
  isStaging: boolean,
): TokenWithChainDetails[] {
  return tokens.filter((token) => (isStaging ? true : token.flags[type])).map(convertToTokenWithChainDetails);
}

function convertToTokenWithChainDetails(token: TokenWithChainDetailsWithFlags): TokenWithChainDetails {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { flags, ...rest } = token;
  return rest;
}
