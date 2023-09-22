import { Big, BigSource } from "big.js";
import BN from "bn.js";
import { PoolInfo, Token } from "../../tokens-info";
import { SYSTEM_PRECISION } from "./constants";

export function getFeePercent(input: BigSource, output: BigSource): number {
  return Big(100).minus(Big(100).times(output).div(input)).toNumber();
}

export function toSystemPrecision(amount: BigSource, decimals: number): Big {
  return convertAmountPrecision(amount, decimals, SYSTEM_PRECISION).round(0, 0);
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
  const amountValue = Big(amountInt);
  if (amountValue.eq(0)) {
    return Big(0);
  }
  return Big(amountValue).div(toPowBase10(decimals));
}

export function calculatePoolInfoImbalance(poolInfo: Pick<PoolInfo, "tokenBalance" | "vUsdBalance">): string {
  return convertIntAmountToFloat(Big(poolInfo.tokenBalance).minus(poolInfo.vUsdBalance).toFixed(), SYSTEM_PRECISION)
    .div(2)
    .toFixed();
}

export function swapToVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "p" | "imbalance">
): string {
  const amountValue = Big(amount);
  if (amountValue.lte(0)) {
    return "0";
  }
  const fee = amountValue.times(feeShare);
  const amountWithoutFee = amountValue.minus(fee);
  const inSystemPrecision = toSystemPrecision(amountWithoutFee, decimals);
  const tokenBalance = Big(poolInfo.tokenBalance).plus(inSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance, poolInfo.aValue, poolInfo.dValue);
  return Big(poolInfo.vUsdBalance).minus(vUsdNewAmount).round(0, 0).toFixed();
}

export function swapFromVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "imbalance">
): string {
  const amountValue = Big(amount);
  if (amountValue.lte(0)) {
    return Big(0).toFixed();
  }
  const vUsdBalance = amountValue.plus(poolInfo.vUsdBalance);
  const newAmount = getY(vUsdBalance, poolInfo.aValue, poolInfo.dValue);
  const result = fromSystemPrecision(Big(poolInfo.tokenBalance).minus(newAmount), decimals);
  const fee = Big(result).times(feeShare);
  return Big(result).minus(fee).round(0, 0).toFixed();
}

export function swapToVUsdReverse(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "imbalance">
): Big {
  if (Big(amount).lte(0)) {
    return Big(0);
  }
  const vUsdNewAmount = Big(poolInfo.vUsdBalance).minus(amount);
  const tokenBalance = getY(vUsdNewAmount, poolInfo.aValue, poolInfo.dValue);
  const inSystemPrecision = Big(tokenBalance).minus(poolInfo.tokenBalance);
  const amountWithoutFee = fromSystemPrecision(inSystemPrecision, decimals);
  const reversedFeeShare = Big(feeShare).div(Big(1).minus(feeShare));
  const fee = Big(amountWithoutFee).times(reversedFeeShare).round(0, Big.roundUp);
  return Big(amountWithoutFee).plus(fee).round(0, 0);
}

export function swapFromVUsdReverse(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "imbalance">
): Big {
  if (Big(amount).lte(0)) {
    return Big(0);
  }
  const reversedFeeShare = Big(feeShare).div(Big(1).minus(feeShare));
  const fee = Big(amount).times(reversedFeeShare).round(0, Big.roundUp);
  const amountWithFee = Big(amount).plus(fee);
  const inSystemPrecision = toSystemPrecision(amountWithFee, decimals);
  const tokenBalance = Big(poolInfo.tokenBalance).minus(inSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance, poolInfo.aValue, poolInfo.dValue);
  return Big(vUsdNewAmount).minus(poolInfo.vUsdBalance).round(0, 0);
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
