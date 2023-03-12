export type {
  ApproveData,
  TransactionResponse,
  BaseSendParams,
  CheckAllowanceParamsWithTokenAddress,
  CheckAllowanceParamsWithTokenInfo,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenAddress,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
} from "../services/bridge/models/bridge.model";
export type { TransferStatusResponse, BridgeTransaction } from "../client/core-api/core-api.model";
export { Messenger } from "../client/core-api/core-api.model";
export { ChainSymbol, ChainType } from "../chains/index";
export type {
  TokenInfoWithChainDetails,
  TransferTime,
  MessengerTransferTime,
  PoolInfo,
} from "../tokens-info/tokens-info.model";
export { RawTransactionBuilder } from "../raw-transaction-builder";
export type {
  UserBalanceInfo,
  UserBalanceInfoDTO,
  LiquidityPoolsParams,
  LiquidityPoolsParamsWithAmount,
} from "../services/liquidity-pool/models/pool.model";

export interface AmountsAndTxCost {
  /**
   * The amount of tokens to be sent.
   */
  amountToSendFloat: string;

  /**
   * The amount of tokens to be received.
   */
  amountToBeReceivedFloat: string;

  /**
   * The amount of gas fee to pay for the transfer in the smallest denomination of the source chain currency.
   */
  txCost: string;
}
