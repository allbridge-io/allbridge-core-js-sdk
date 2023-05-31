import { Big, BigSource } from "big.js";
import BN from "bn.js";
import { AllbridgeCachingCoreClient } from "../../client/core-api/caching-core-client";
import { Pool, Token, TokenWithChainDetails } from "../../tokens-info";
import { SYSTEM_PRECISION } from "./constants";

export function getFeePercent(input: BigSource, output: BigSource): number {
  return Big(100).minus(Big(100).times(output).div(input)).toNumber();
}

export function toSystemPrecision(amount: BigSource, decimals: number): Big {
  return convertAmountPrecision(amount, decimals, SYSTEM_PRECISION);
}

export function fromSystemPrecision(amount: BigSource, decimals: number): Big {
  return convertAmountPrecision(amount, SYSTEM_PRECISION, decimals);
}

export function convertAmountPrecision(amount: BigSource, decimalsFrom: number, decimalsTo: number): Big {
  const dif = Big(decimalsTo).minus(decimalsFrom).toNumber();
  return Big(amount).times(toPowBase10(dif));
}

export function toPowBase10(decimals: number): Big {
  return Big(10).pow(decimals);
}

export function convertFloatAmountToInt(amountFloat: BigSource, decimals: number): Big {
  return Big(amountFloat).times(toPowBase10(decimals));
}

export function convertIntAmountToFloat(amountInt: BigSource, decimals: number): Big {
  return Big(amountInt).div(toPowBase10(decimals));
}

export async function getPoolByToken(api: AllbridgeCachingCoreClient, sourceChainToken: TokenWithChainDetails) {
  return await api.getPoolByKey({
    chainSymbol: sourceChainToken.chainSymbol,
    poolAddress: sourceChainToken.poolAddress,
  });
}

export interface SwapToVUsdCalcResult {
  bridgeFeeInTokenPrecision: string;
  amountIncludingCommissionInSystemPrecision: string;
  amountExcludingCommissionInSystemPrecision: string;
}

export function swapToVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  pool: Omit<Pool, "p">
): SwapToVUsdCalcResult {
  const amountValue = Big(amount);
  const fee = amountValue.times(feeShare);
  const amountWithoutFee = amountValue.minus(fee);
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInSystemPrecision: calcSwapToVUsd(toSystemPrecision(amountWithoutFee, decimals), pool),
    amountExcludingCommissionInSystemPrecision: calcSwapToVUsd(toSystemPrecision(amountValue, decimals), pool),
  };
}

function calcSwapToVUsd(amountInSystemPrecision: Big, poolInfo: Omit<Pool, "p">): string {
  const tokenBalance = Big(poolInfo.tokenBalance).plus(amountInSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance.toFixed(), poolInfo.aValue, poolInfo.dValue);
  return Big(poolInfo.vUsdBalance).minus(vUsdNewAmount).round().toFixed();
}

export interface SwapFromVUsdCalcResult {
  bridgeFeeInTokenPrecision: string;
  amountIncludingCommissionInTokenPrecision: string;
  amountExcludingCommissionInTokenPrecision: string;
}

export function swapFromVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  pool: Pool
): SwapFromVUsdCalcResult {
  const amountValue = Big(amount);
  const vUsdBalance = amountValue.plus(pool.vUsdBalance);
  const newAmount = getY(vUsdBalance, pool.aValue, pool.dValue);
  const result = fromSystemPrecision(Big(pool.tokenBalance).minus(newAmount), decimals);
  const fee = Big(result).times(feeShare);
  const resultWithoutFee = Big(result).minus(fee).round();
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInTokenPrecision: resultWithoutFee.toFixed(),
    amountExcludingCommissionInTokenPrecision: result.toFixed(),
  };
}

export function swapToVUsdReverse(
  amountInTokenPrecision: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  pool: Pool
): SwapToVUsdCalcResult {
  const reversedFeeShare = Big(feeShare).div(Big(1).minus(feeShare));
  const fee = Big(amountInTokenPrecision).times(reversedFeeShare);
  const amountWithFee = Big(amountInTokenPrecision).plus(fee);
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInSystemPrecision: calcSwapToVUsdReverse(toSystemPrecision(amountWithFee, decimals), pool),
    amountExcludingCommissionInSystemPrecision: calcSwapToVUsdReverse(
      toSystemPrecision(amountInTokenPrecision, decimals),
      pool
    ),
  };
}

function calcSwapToVUsdReverse(amountInSystemPrecision: Big, pool: Pool): string {
  const tokenBalance = Big(pool.tokenBalance).minus(amountInSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance.toFixed(), pool.aValue, pool.dValue);
  return Big(vUsdNewAmount).minus(pool.vUsdBalance).round().toFixed();
}

export function swapFromVUsdReverse(
  amountInSystemPrecision: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  pool: Pool
): SwapFromVUsdCalcResult {
  const vUsdNewAmount = Big(pool.vUsdBalance).minus(amountInSystemPrecision);
  const tokenBalance = getY(vUsdNewAmount.toFixed(), pool.aValue, pool.dValue);
  const inSystemPrecision = Big(tokenBalance).minus(pool.tokenBalance);
  const amountWithoutFee = fromSystemPrecision(inSystemPrecision.toFixed(), decimals);
  const reversedFeeShare = Big(feeShare).div(Big(1).minus(feeShare));
  const fee = Big(amountWithoutFee).times(reversedFeeShare);
  const amount = Big(amountWithoutFee).plus(fee);
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInTokenPrecision: amount.round().toFixed(),
    amountExcludingCommissionInTokenPrecision: amountWithoutFee.toFixed(),
  };
}

// y = (sqrt(x(4ad³ + x (4a(d - x) - d )²)) + x (4a(d - x) - d ))/8ax
// commonPart = 4a(d - x) - d
// sqrt = sqrt(x * (4ad³ + x * commonPart²)
// y =   (sqrt + x * commonPart) / divider
export function getY(x: BigSource, a: BigSource, d: BigSource): Big {
  const commonPartBig = Big(4).times(a).times(Big(d).minus(x)).minus(d);
  const dCubed = Big(d).pow(3);
  const commonPartSquared = commonPartBig.pow(2);
  const sqrtBig = Big(x)
    .times(Big(x).times(commonPartSquared).plus(Big(4).times(a).times(dCubed)))
    .sqrt()
    .round(0, 0);
  const dividerBig = Big(8).times(a).times(x);
  return commonPartBig.times(x).plus(sqrtBig).div(dividerBig).round(0, 0).plus(1); // +1 to offset rounding errors
}

export function getEarned(userLpAmount: string, userRewardDebt: string, accRewardPerShareP: string, p: number): string {
  const userLpAmountBN = new BN(userLpAmount);
  const accRewardPerSharePBN = new BN(accRewardPerShareP);
  const userRewardDebtBN = new BN(userRewardDebt);
  const rewards = userLpAmountBN.mul(accRewardPerSharePBN).shrn(p);
  return rewards.sub(userRewardDebtBN).toString();
}

export function aprInPercents(apr: number): string {
  return apr * 100 > 0 ? `${Number(Big(apr).times(100).toFixed(2)).toLocaleString()}%` : "N/A";
}

// a = 8Axy(x+y)
// b = xy(16A - 4) / 3
// c = sqrt(a² + b³)
// D = cbrt(a + c) + cbrt(a - c)
export function getD(aValue: string, x: string, y: string): string {
  const xy = Big(x).times(y);
  const xPlusY = Big(x).plus(y);
  const a = Big(8).times(aValue).times(xy).times(xPlusY);
  const b = xy.times(Big(16).times(aValue).minus(4)).div(3);
  const aSquared = a.times(a);
  const bCubed = b.times(b).times(b);
  const a2b3 = aSquared.plus(bCubed);
  const c = Big(a2b3).sqrt();
  const cbrtAPlusC = Big(Math.cbrt(+a.plus(c).toFixed()));
  const cbrtAMinusC = Big(Math.cbrt(+a.minus(c).toFixed()));
  return cbrtAPlusC.plus(cbrtAMinusC).toFixed();
}
