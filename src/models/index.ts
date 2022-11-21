export {
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
  Provider,
} from "../bridge/models/bridge.model";
export {
  Messenger,
  TransferStatusResponse,
  BridgeTransaction,
} from "../client/core-api/core-api.model";
export { ChainSymbol, ChainType } from "../chains/index";
export {
  TokenInfoWithChainDetails,
  TxTime,
  MessengerTxTime,
  PoolInfo,
} from "../tokens-info/tokens-info.model";
export { RawTransactionBuilder } from "../raw-transaction-builder";

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
