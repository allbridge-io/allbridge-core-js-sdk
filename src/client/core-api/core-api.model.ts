import { ChainSymbol } from "../../chains/chain.enums";
import { PoolInfo, SuiAddresses } from "../../tokens-info";

export type ChainDetailsResponse = Record<string, ChainDetailsDTO>;

export interface AbrPayerChainInfoDTO {
  payerAddress: string;
  tokenAddress: string;
  tokenDecimals: number;
  payerAvailability: AbrPayerAvailabilityTypeDTO;
}

export interface ChainDetailsDTO {
  tokens: TokenDTO[];
  chainId: number;
  bridgeId?: string;
  paddingUtilId?: string;
  /** @deprecated Do not use. */
  bridgeAddress: string;
  oftBridgeAddress?: string;
  abrPayer?: AbrPayerChainInfoDTO;
  swapAddress: string;
  yieldAddress?: string;
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
  /** @deprecated Do not use. */
  poolAddress: string;
  tokenAddress: string;
  /** @deprecated Do not use. */
  poolInfo: PoolInfoDTO;
  oftId?: string;
  /** @deprecated Do not use. */
  feeShare: string;
  /** @deprecated Do not use. */
  apr: string;
  /** @deprecated Do not use. */
  apr7d: string;
  /** @deprecated Do not use. */
  apr30d: string;
  /** @deprecated Do not use. */
  lpRate: string;
  cctpAddress?: string;
  cctpV2Address?: string;
  cctpFeeShare?: string;
  cctpV2FeeShare?: string;
  yieldId?: number;
  xReserve?: XReserveDTO;
  flags: {
    swap: boolean;
    /** @deprecated Do not use. */
    pool: boolean;
  };
}

export interface XReserveDTO {
  bridgeAddress: string;
  feeConst: string;
  feeShare: string;
  protocolAddress?: string;
}

/**
 * @deprecated Do not use.
 */
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
  /** @deprecated Do not use. */
  ALLBRIDGE = "allbridge",
  /** @deprecated Do not use. */
  WORMHOLE = "wormhole",
  CCTP = "cctp",
  CCTP_V2 = "cctpV2",
  OFT = "oft",
  X_RESERVE = "xReserve",
}

export type AbrPayerAvailabilityKeyDTO = (typeof MessengerKeyDTO)[keyof typeof MessengerKeyDTO];

export type AbrPayerAvailabilityTypeDTO = Partial<Record<AbrPayerAvailabilityKeyDTO, boolean>>;

export type TransferTimeDTO = Record<string, MessengerTransferTimeDTO>;

export interface TxCostAmountDTO {
  maxAmount: string;
  swap: string;
  transfer: string;
}

export type MessengerTransferTimeDTO = {
  [messenger in MessengerKeyDTO]: number | null;
};

export enum Messenger {
  /** @deprecated Do not use. */
  ALLBRIDGE = 1,
  /** @deprecated Do not use. */
  WORMHOLE = 2,
  CCTP = 3,
  CCTP_V2 = 4,
  OFT = 5,
  X_RESERVE = 6,
}

export type LegacyMessenger = Messenger.ALLBRIDGE | Messenger.WORMHOLE;
export type ActiveMessenger = Exclude<Messenger, LegacyMessenger>;

export interface ReceiveTransactionCostRequest {
  sourceChainId: number;
  destinationChainId: number;
  messenger: Messenger;
  sourceToken?: string;
}

export interface ReceiveTransactionCostResponse {
  exchangeRate: string;
  fee: string;
  sourceNativeTokenPrice: string;
  abrExchangeRate?: string;
  adminFeeShareWithExtras?: string;
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

  originSourceTokenAddress?: string;
  originDestinationTokenAddress?: string;

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

  originSourceTokenAddress?: string;
  originDestinationTokenAddress?: string;

  hash: string;

  messenger: Messenger;

  blockTime: number;
  blockId: string;

  confirmations: number;
  confirmationsNeeded: number;

  isClaimable?: boolean;
}

/**
 * @deprecated Do not use.
 */
export type PoolInfoResponse = Record<string, PoolInfo>;
/**
 * @deprecated Do not use.
 */
export type PendingInfoResponse = Partial<Record<string, TokenPendingInfoDTO>>;
/**
 * @deprecated Do not use.
 */
export type TokenPendingInfoDTO = Record<string, PendingInfoDTO>;

/**
 * @deprecated Do not use.
 */
export interface PendingInfoDTO {
  pendingTxs: number;
  totalSentAmount: string;
}
