import { ChainSymbol } from "../../chains";
import { PoolInfo } from "../../tokens-info";

export type ChainDetailsResponse = Record<string, ChainDetailsDTO>;

export interface ChainDetailsDTO {
  tokens: TokenDTO[];
  chainId: number;
  bridgeAddress: string;
  transferTime: TransferTimeDTO;
  txCostAmount: TxCostAmountDTO;
  confirmations: number;
}

export interface TokenDTO {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  poolInfo: PoolInfoDTO;
  feeShare: string;
  apr: number;
  lpRate: number;
}

export interface PoolInfoDTO {
  aValue: string;
  dValue: string;
  tokenBalance: string;
  vUsdBalance: string;
  totalLpAmount: string;
  accRewardPerShareP: string;
  p: number;
}

export enum MessengerKeyDTO {
  ALLBRIDGE = "allbridge",
  WORMHOLE = "wormhole",
}

export type TransferTimeDTO = {
  [chain in ChainSymbol]: MessengerTransferTimeDTO;
};

export interface TxCostAmountDTO {
  maxAmount: string;
  swap: string;
  transfer: string;
}

export type MessengerTransferTimeDTO = {
  [messenger in MessengerKeyDTO]: number;
};

export enum Messenger {
  ALLBRIDGE = 1,
  WORMHOLE = 2,
}

export interface ReceiveTransactionCostRequest {
  sourceChainId: number;
  destinationChainId: number;
  messenger: Messenger;
}

export interface ReceiveTransactionCostResponse {
  exchangeRate: string;
  fee: string;
  sourceNativeTokenPrice: string;
}

export interface TransferStatusResponse {
  txId: string;

  sourceChainSymbol: ChainSymbol;
  destinationChainSymbol: ChainSymbol;

  sendAmount: string;
  sendAmountFormatted: number;

  stableFee: string;
  stableFeeFormatted: number;

  sourceTokenAddress: string;
  destinationTokenAddress: string;

  senderAddress: string;
  recipientAddress: string;

  signaturesCount: number;
  signaturesNeeded: number;

  send: BridgeTransaction;
  receive?: BridgeTransaction;
}

export interface BridgeTransaction {
  txId: string;

  sourceChainId: number;
  destinationChainId: number;

  fee: string;
  feeFormatted: number;

  stableFee: string;
  stableFeeFormatted: number;

  amount: string;
  amountFormatted: number;
  virtualAmount: string;

  bridgeContract: string;
  sender: string;
  recipient: string;

  sourceTokenAddress: string;
  destinationTokenAddress: string;

  hash: string;

  messenger: Messenger;

  blockTime: number;
  blockId: string;

  confirmations: number;
  confirmationsNeeded: number;
}

export type PoolInfoResponse = {
  [chainSymbol in ChainSymbol]?: {
    string: PoolInfo;
  };
};
