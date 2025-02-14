import { ChainSymbol } from "../../chains/chain.enums";
import { PoolInfo, SuiAddresses } from "../../tokens-info";

export type ChainDetailsResponse = Record<string, ChainDetailsDTO>;

export interface ChainDetailsDTO {
  tokens: TokenDTO[];
  chainId: number;
  bridgeAddress: string;
  transferTime: TransferTimeDTO;
  txCostAmount: TxCostAmountDTO;
  confirmations: number;
  suiAddresses?: SuiAddresses;
}

export enum AddressStatus {
  OK = "OK",
  INVALID = "INVALID",
  FORBIDDEN = "FORBIDDEN",
  UNINITIALIZED = "UNINITIALIZED",
  CONTRACT_ADDRESS = "CONTRACT_ADDRESS",
  WRONG_ASSOCIATED_ACCOUNT_OWNER = "WRONG_ASSOCIATED_ACCOUNT_OWNER",
}

export interface TokenDTO {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  poolInfo: PoolInfoDTO;
  feeShare: string;
  apr: string;
  apr7d: string;
  apr30d: string;
  lpRate: string;
  flags: {
    swap: boolean;
    pool: boolean;
  };
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
  CCTP = "cctp",
}

export type TransferTimeDTO = Record<string, MessengerTransferTimeDTO>;

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
  CCTP = 3,
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

export interface GasBalanceResponse {
  gasBalance: string | null;
  status: AddressStatus;
}

export interface CheckAddressResponse {
  gasBalance: string | null;
  status: AddressStatus;
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

  responseTime?: number;
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

  isClaimable?: boolean;
}

export type PoolInfoResponse = Record<ChainSymbol, PoolInfo>;
export type PendingInfoResponse = Partial<Record<ChainSymbol, TokenPendingInfoDTO>>;
export type TokenPendingInfoDTO = Record<string, PendingInfoDTO>;

export interface PendingInfoDTO {
  pendingTxs: number;
  totalSentAmount: string;
}
