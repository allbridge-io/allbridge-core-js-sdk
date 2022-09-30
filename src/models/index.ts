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
  fromAmount: string;
  toAmount: string;
  txCost: string;
}
