export {
  ApproveData,
  TransactionResponse,
  BaseSendParams,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  BaseProvider,
  Provider,
} from "../bridge/models/bridge.model";
export { EvmProvider } from "../bridge/evm/models/index";
export { TronProvider } from "../bridge/trx/models/index";
export { Messenger } from "../client/core-api/core-api.model";
export { ChainSymbol } from "../chains/index";
export { TokenInfoWithChainDetails } from "../tokens-info/tokens-info.model";

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
