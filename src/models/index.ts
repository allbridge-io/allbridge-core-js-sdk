export {
  ApproveData,
  TransactionResponse,
  BaseSendParams,
  ChainSymbolsSendParams,
  TokensInfoSendParams,
} from "../bridge/models/bridge.model";
export { Messenger } from "../client/core-api/core-api.model";
export { ChainSymbol } from "../chains/index";
export { TokenInfoWithChainDetails } from "../tokens-info/tokens-info.model";

export interface AmountsAndTxCost {
  /**
   * The amount of tokens to be sent.
   */
  fromAmount: string;

  /**
   * The amount of tokens to be received.
   */
  toAmount: string;

  /**
   * The amount to pay for the swap in the smallest denomination of the source chain currency.
   */
  txCost: string;
}
