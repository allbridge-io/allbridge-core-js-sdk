import Web3 from "web3";
import { chainProperties, ChainType } from "../chains";
import { AllbridgeCoreClient } from "../client/core-api";
import { ChainDetailsMap } from "../tokens-info";
import {
  convertFloatAmountToInt,
  convertIntAmountToFloat,
} from "../utils/calculation";
import { EvmBridge } from "./evm";
import {
  ApproveData,
  Bridge,
  CheckAllowanceParamsDto,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsDto,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  Provider,
  RawTransaction,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TransactionResponse,
  TxSendParams,
} from "./models";
import { TronBridge } from "./trx";
import {
  formatAddress,
  getDecimalsByContractAddress,
  getTokenInfoByTokenAddress,
  isGetAllowanceParamsWithTokenInfo,
  isSendParamsWithChainSymbol,
} from "./utils";

export class BridgeService {
  private chainDetailsMap: ChainDetailsMap | undefined;

  constructor(public api: AllbridgeCoreClient) {}

  async getAllowance(
    provider: Provider,
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<string> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    const allowanceInt = await this.getBridge(provider).getAllowance(
      getAllowanceParams
    );
    return convertIntAmountToFloat(
      allowanceInt,
      getAllowanceParams.tokenInfo.decimals
    ).toFixed();
  }

  async checkAllowance(
    provider: Provider,
    params:
      | CheckAllowanceParamsWithTokenAddress
      | CheckAllowanceParamsWithTokenInfo
  ): Promise<boolean> {
    return this.getBridge(provider).checkAllowance(
      await this.prepareCheckAllowanceParams(params)
    );
  }

  async approve(
    provider: Provider,
    approveData: ApproveData
  ): Promise<TransactionResponse> {
    return this.getBridge(provider).approve(approveData);
  }

  async buildRawTransactionApprove(
    provider: Provider,
    approveData: ApproveData
  ): Promise<RawTransaction> {
    return this.getBridge(provider).buildRawTransactionApprove(approveData);
  }

  async send(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TransactionResponse> {
    const bridge = this.getBridge(provider);
    const txSendParams = await this.prepareTxSendParams(
      bridge.chainType,
      params
    );
    return bridge.sendTx(txSendParams);
  }

  async buildRawTransactionSend(
    provider: Provider,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<RawTransaction> {
    const bridge = this.getBridge(provider);
    const txSendParams = await this.prepareTxSendParams(
      bridge.chainType,
      params
    );
    return bridge.buildRawTransactionSend(txSendParams);
  }

  private getBridge(provider: Provider): Bridge {
    if (this.isTronWeb(provider)) {
      return new TronBridge(provider);
    } else {
      // Web3
      return new EvmBridge(provider as Web3);
    }
  }

  private isTronWeb(params: Provider): boolean {
    // @ts-expect-error get existing trx property
    return (params as TronWeb).trx !== undefined;
  }

  public async getChainDetailsMap(): Promise<ChainDetailsMap> {
    if (this.chainDetailsMap === undefined) {
      this.chainDetailsMap = (await this.api.getTokensInfo()).chainDetailsMap();
    }
    return this.chainDetailsMap;
  }

  async prepareTxSendParams(
    bridgeChainType: ChainType,
    params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
  ): Promise<TxSendParams> {
    const txSendParams = {} as TxSendParams;
    let fromChainId;
    let toChainType;

    if (isSendParamsWithChainSymbol(params)) {
      const chainDetailsMap = await this.getChainDetailsMap();
      fromChainId = chainDetailsMap[params.fromChainSymbol].allbridgeChainId;
      toChainType = chainProperties[params.toChainSymbol].chainType;
      txSendParams.contractAddress =
        chainDetailsMap[params.fromChainSymbol].bridgeAddress;
      txSendParams.fromTokenAddress = params.fromTokenAddress;
      txSendParams.toChainId =
        chainDetailsMap[params.toChainSymbol].allbridgeChainId;
      txSendParams.toTokenAddress = params.toTokenAddress;
      txSendParams.amount = convertFloatAmountToInt(
        params.amount,
        getDecimalsByContractAddress(
          chainDetailsMap,
          params.fromChainSymbol,
          txSendParams.fromTokenAddress
        )
      ).toFixed();
    } else {
      fromChainId = params.sourceChainToken.allbridgeChainId;
      toChainType =
        chainProperties[params.destinationChainToken.chainSymbol].chainType;
      txSendParams.contractAddress = params.sourceChainToken.bridgeAddress;
      txSendParams.fromTokenAddress = params.sourceChainToken.tokenAddress;
      txSendParams.toChainId = params.destinationChainToken.allbridgeChainId;
      txSendParams.toTokenAddress = params.destinationChainToken.tokenAddress;
      txSendParams.amount = convertFloatAmountToInt(
        params.amount,
        params.sourceChainToken.decimals
      ).toFixed();
    }
    txSendParams.messenger = params.messenger;
    txSendParams.fromAccountAddress = params.fromAccountAddress;

    let { fee } = params;
    if (fee == null) {
      fee = await this.api.getReceiveTransactionCost({
        sourceChainId: fromChainId,
        destinationChainId: txSendParams.toChainId,
        messenger: txSendParams.messenger,
      });
    }
    txSendParams.fee = fee;

    txSendParams.fromTokenAddress = formatAddress(
      txSendParams.fromTokenAddress,
      bridgeChainType,
      bridgeChainType
    );
    txSendParams.toAccountAddress = formatAddress(
      params.toAccountAddress,
      toChainType,
      bridgeChainType
    );
    txSendParams.toTokenAddress = formatAddress(
      txSendParams.toTokenAddress,
      toChainType,
      bridgeChainType
    );
    return txSendParams;
  }

  async prepareGetAllowanceParams(
    params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
  ): Promise<GetAllowanceParamsDto> {
    if (isGetAllowanceParamsWithTokenInfo(params)) {
      return params as GetAllowanceParamsDto;
    } else {
      const tokenInfo = getTokenInfoByTokenAddress(
        await this.getChainDetailsMap(),
        (params as GetAllowanceParamsWithTokenAddress).chainSymbol,
        (params as GetAllowanceParamsWithTokenAddress).tokenAddress
      );
      return {
        tokenInfo,
        owner: params.owner,
      };
    }
  }

  async prepareCheckAllowanceParams(
    params:
      | CheckAllowanceParamsWithTokenAddress
      | CheckAllowanceParamsWithTokenInfo
  ): Promise<CheckAllowanceParamsDto> {
    const getAllowanceParams = await this.prepareGetAllowanceParams(params);
    return {
      ...getAllowanceParams,
      amount: convertFloatAmountToInt(
        params.amount,
        getAllowanceParams.tokenInfo.decimals
      ),
    };
  }
}
