export type SolanaTxFee = PricePerUnitInMicroLamports | ExtraFeeInLamports | typeof SolanaAutoTxFee;
/**
 * Priority Fee will be calculated based on {@link https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getRecentPrioritizationFees}
 */
export const SolanaAutoTxFee = "AUTO";

/**
 * Add Priority Fee as price per unit in micro-lamports
 */
export interface PricePerUnitInMicroLamports {
  pricePerUnitInMicroLamports: string;
}

/**
 * Total Priority Fee impact will be as extraFeeInLamports param
 */
export interface ExtraFeeInLamports {
  extraFeeInLamports: string;
}
