import { BasicChainProperties } from "../chains/models";
import { Messenger } from "../client/core-api/core-api.model";

/**
 * Type representing a map of blockchain chain symbols to their corresponding details, including token information.
 *
 * @typedef {Record<string, ChainDetailsWithTokens>} ChainDetailsMap
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {ChainDetailsWithTokens} chainDetails - The detailed information of the specified chain, including token information.
 */
export type ChainDetailsMap = Record<string, ChainDetailsWithTokens>;

export type ChainDetailsMapWithFlags = Record<string, ChainDetailsWithTokensWithFlags>;

export interface AbrPayerChainInfo {
  /**
   * ABR proxy for paying fees with ABR
   */
  payerAddress: string;
  abrToken: TokenCoreFields;
  /**
   * Availability to pay by abr
   */
  payerAvailability: AbrPayerAvailability;
}

/**
 * Contains some blockchain details
 */
export interface ChainDetails extends BasicChainProperties {
  /**
   * Allbridge's Id
   */
  allbridgeChainId: number;
  /**
   * Algo Bridge appId
   */
  bridgeId?: string;
  /**
   * Algo Padding appId
   */
  paddingUtilId?: string;
  /**
   * Bridge contract address
   * @deprecated Do not use.
   */
  bridgeAddress: string;
  /**
   * OFT Bridge contract address
   * Optional. Defined if the chain supports OFT
   */
  oftBridgeAddress?: string;
  /**
   * Yield contract address
   */
  yieldAddress?: string;
  /**
   * ABR payer chain info
   */
  abrPayer?: AbrPayerChainInfo;
  /**
   * Average transfer time to other blockchains
   */
  transferTime: TransferTime;
  /**
   * Transfers costs
   */
  txCostAmount: TxCostAmount;
  /**
   * Number of confirmations required
   */
  confirmations: number;
  /**
   * Sui addresses
   * Optional. Defined for SUI
   */
  suiAddresses?: SuiAddresses;
}

/**
 * Contains tokens list
 */
export interface ChainDetailsWithTokens extends ChainDetails {
  /**
   * Tokens
   */
  tokens: TokenWithChainDetails[];
}

/**
 * Contains tokens list
 */
export interface ChainDetailsWithTokensWithFlags extends ChainDetails {
  /**
   * Tokens
   */
  tokens: TokenWithChainDetailsWithFlags[];
}

/**
 * Contains token information
 */
export interface Token {
  /**
   * Token symbol
   */
  symbol: string;
  /**
   * Token name
   */
  name: string;
  /**
   * Token decimals
   */
  decimals: number;
  /**
   * Token pool address
   * @deprecated Do not use.
   */
  poolAddress: string;
  /**
   * Token address
   */
  tokenAddress: string;
  /**
   * Token origin address
   */
  originTokenAddress?: string;
  /**
   * Token CCTP address</br>
   * Optional. Defined if the token is supported by CCTP
   */
  cctpAddress?: string;
  /**
   * Token fee share for CCTP</br>
   * Optional. Defined if the token is supported by CCTP
   */
  cctpFeeShare?: string;
  /**
   * Token CCTP address</br>
   * Optional. Defined if the token is supported by CCTP
   */
  cctpV2Address?: string;
  /**
   * Token fee share for CCTP V2</br>
   * Optional. Defined if the token is supported by CCTP
   */
  cctpV2FeeShare?: string;
  /**
   * XReserve bridge configuration for token.
   * Optional. Defined if the token is supported by XReserve
   */
  xReserve?: XReserveTokenInfo;
  /**
   * Internal identifier for the same token across different chains.
   *
   * Used to link representations of a token deployed on multiple networks (e.g., Ethereum, BSC).
   * Tokens with the same `oftId` are considered to be equivalent.
   *
   * Optional. Defined if the token is supported by OFT
   */
  oftId?: string;
  /**
   * Token fee share
   * @deprecated Do not use.
   */
  feeShare: string;
  /**
   * @Deprecated use {@link apr7d}</br>
   * Token APR
   */
  apr: string;
  /**
   * Token APR based on last 7 days
   * @deprecated Do not use.
   */
  apr7d: string;
  /**
   * Token APR based on last 30 days
   * @deprecated Do not use.
   */
  apr30d: string;
  /**
   * Token LP rate
   * @deprecated Do not use.
   */
  lpRate: string;

  yieldId?: number;
  /**
   * Sui addresses
   * Optional. Defined for SUI
   */
  suiAddresses?: SuiAddresses;
}

export interface XReserveTokenInfo {
  bridgeAddress: string;
  feeConst: string;
  feeShare: string;
  protocolAddress?: string;
}

export interface SuiAddresses {
  /** @deprecated Do not use. */
  bridgeAddress: string;
  /** @deprecated Do not use. */
  bridgeAddressOrigin?: string;
  /** @deprecated Do not use. */
  bridgeObjectAddress: string;

  /** @deprecated Do not use. */
  allbridgeMessengerAddress: string;
  /** @deprecated Do not use. */
  allbridgeMessengerAddressOrigin?: string;
  /** @deprecated Do not use. */
  allbridgeMessengerObjectAddress: string;

  gasOracleAddress: string;
  gasOracleAddressOrigin?: string;
  gasOracleObjectAddress: string;

  utilsAddress: string;

  /** @deprecated Do not use. */
  wormholeMessengerAddress: string;
  /** @deprecated Do not use. */
  wormholeMessengerAddressOrigin?: string;
  /** @deprecated Do not use. */
  wormholeMessengerObjectAddress: string;
  /** @deprecated Do not use. */
  wormholeStateObjectAddress: string;

  cctpAddress: string;
  cctpAddressOrigin?: string;
  cctpObjectAddress: string;

  cctpDenyListObjectAddress: string;
  cctpMessageTransmitterStateObjectAddress: string;
  cctpTokenMessengerMinterStateObjectAddress: string;
  cctpTreasuryObjectAddress: string;
}

/**
 * General Token Interface
 */
export interface TokenWithChainDetails extends Token, Omit<ChainDetails, "name"> {
  /**
   * Blockchain network name
   */
  chainName: string;
}

export type TokenCoreFields = Pick<
  TokenWithChainDetails,
  "tokenAddress" | "chainSymbol" | "decimals" | "originTokenAddress"
>;

export interface TokenWithChainDetailsWithFlags extends TokenWithChainDetails {
  flags: {
    swap: boolean;
    /** @deprecated Do not use. */
    pool: boolean;
  };
}

/**
 * General Pool Interface
 * @deprecated Do not use.
 */
export interface PoolInfo {
  /**
   * Pool A value
   */
  aValue: string;
  /**
   * Pool D value
   */
  dValue: string;
  /**
   * Pool token balance
   */
  tokenBalance: string;
  /**
   * Pool virtual USD balance
   */
  vUsdBalance: string;
  /**
   * Pool total liquidity amount
   */
  totalLpAmount: string;
  /**
   * Current accumulated reward per share shifted by P bits
   */
  accRewardPerShareP: string;
  /**
   * P value, needed for accRewardPerShareP
   */
  p: number;
  /**
   * Pool imbalance
   */
  imbalance: string;
}

export type AbrPayerAvailability = Partial<Record<Messenger, boolean>>;

/**
 * Type representing transfer times for various blockchain chains.
 *
 * @typedef {Record<string, MessengerTransferTime>} TransferTime
 * @property {string} chainSymbol - The symbol of the chain representing one of the supported blockchain networks (e.g., "ETH" for Ethereum). For more details, see: {@link ChainSymbol}.
 * @property {MessengerTransferTime} transferTime - The average transfer time details for the specified chain.
 */
export type TransferTime = Record<string, MessengerTransferTime>;

/**
 * Contains Avg transaction time withing different messenger protocols
 */
export type MessengerTransferTime = {
  [messenger in Messenger]?: number;
};

/**
 * @deprecated Do not use.
 */
export interface PoolKeyObject {
  chainSymbol: string;
  poolAddress: string;
}

/**
 * Contains transfer costs
 */
export interface TxCostAmount {
  /**
   * The maximum gas amount that can be received as extra gas for one transfer
   */
  maxAmount: string;
  /**
   * Swap cost
   */
  swap: string;
  /**
   * Transfer cost
   */
  transfer: string;
}

/**
 * @deprecated Do not use.
 */
export type PoolInfoMap = Record<string, PoolInfo>;
