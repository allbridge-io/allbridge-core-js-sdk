import { Big, BigSource } from "big.js";
import { TokenInfo } from "../../tokens-info";
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

export function swapToVUsd(amount: BigSource, tokenInfo: TokenInfo): Big {
  const amountValue = Big(amount);
  if (amountValue.lte(0)) {
    return Big(0);
  }
  const fee = amountValue.times(tokenInfo.feeShare);
  const amountWithoutFee = amountValue.minus(fee);
  const inSystemPrecision = toSystemPrecision(
    amountWithoutFee,
    tokenInfo.decimals
  );
  const poolInfo = tokenInfo.poolInfo;
  const tokenBalance = Big(poolInfo.tokenBalance).plus(inSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance, poolInfo.aValue, poolInfo.dValue);
  return Big(poolInfo.vUsdBalance).minus(vUsdNewAmount).round(0, 0);
}

export function swapFromVUsd(amount: BigSource, tokenInfo: TokenInfo): Big {
  const amountValue = Big(amount);
  if (amountValue.lte(0)) {
    return Big(0);
  }
  const poolInfo = tokenInfo.poolInfo;
  const vUsdBalance = amountValue.plus(poolInfo.vUsdBalance);
  const newAmount = getY(vUsdBalance, poolInfo.aValue, poolInfo.dValue);
  const result = fromSystemPrecision(
    Big(poolInfo.tokenBalance).minus(newAmount),
    tokenInfo.decimals
  );
  const fee = Big(result).times(tokenInfo.feeShare);
  return Big(result).minus(fee).round(0, 0);
}

export function swapToVUsdReverse(
  amount: BigSource,
  tokenInfo: TokenInfo
): Big {
  if (Big(amount).lte(0)) {
    return Big(0);
  }
  const poolInfo = tokenInfo.poolInfo;
  const vUsdNewAmount = Big(poolInfo.vUsdBalance).minus(amount);
  const tokenBalance = getY(vUsdNewAmount, poolInfo.aValue, poolInfo.dValue);
  const inSystemPrecision = Big(tokenBalance).minus(poolInfo.tokenBalance);
  const amountWithoutFee = fromSystemPrecision(
    inSystemPrecision,
    tokenInfo.decimals
  );
  const reversedFeeShare = Big(tokenInfo.feeShare).div(
    Big(1).minus(tokenInfo.feeShare)
  );
  const fee = Big(amountWithoutFee)
    .times(reversedFeeShare)
    .round(0, Big.roundUp);
  return Big(amountWithoutFee).plus(fee).round(0, 0);
}

export function swapFromVUsdReverse(
  amount: BigSource,
  tokenInfo: TokenInfo
): Big {
  if (Big(amount).lte(0)) {
    return Big(0);
  }
  const reversedFeeShare = Big(tokenInfo.feeShare).div(
    Big(1).minus(tokenInfo.feeShare)
  );
  const fee = Big(amount).times(reversedFeeShare).round(0, Big.roundUp);
  const amountWithFee = Big(amount).plus(fee);
  const inSystemPrecision = toSystemPrecision(
    amountWithFee,
    tokenInfo.decimals
  );
  const poolInfo = tokenInfo.poolInfo;
  const tokenBalance = Big(poolInfo.tokenBalance).minus(inSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance, poolInfo.aValue, poolInfo.dValue);
  return Big(vUsdNewAmount).minus(poolInfo.vUsdBalance).round(0, 0);
}

function convertAmountPrecision(
  amount: BigSource,
  decimalsFrom: number,
  decimalsTo: number
): Big {
  const dif = Big(decimalsTo).minus(decimalsFrom).toNumber();
  return Big(amount).times(toPowBase10(dif)).round(0, 0);
}

export function toPowBase10(decimals: number): Big {
  return Big(10).pow(decimals);
}

export function convertFloatAmountToInt(
  amountFloat: BigSource,
  decimals: number
): Big {
  return Big(amountFloat).times(toPowBase10(decimals));
}

export function convertIntAmountToFloat(
  amountInt: BigSource,
  decimals: number
): Big {
  return Big(amountInt).div(toPowBase10(decimals));
}

// y = (sqrt(x(4ad³ + x (4a(d - x) - d )²)) + x (4a(d - x) - d ))/8ax
// commonPart = 4a(d - x) - d
// sqrt = sqrt(x * (4ad³ + x * commonPart²)
// y =   (sqrt + x * commonPart) / divider
function getY(x: BigSource, a: BigSource, d: BigSource): Big {
  const commonPartBig = Big(4).times(a).times(Big(d).minus(x)).minus(d);
  const dCubed = Big(d).pow(3);
  const commonPartSquared = commonPartBig.pow(2);
  const sqrtBig = Big(x)
    .times(Big(x).times(commonPartSquared).plus(Big(4).times(a).times(dCubed)))
    .sqrt()
    .round(0, 0);
  const dividerBig = Big(8).times(a).times(x);
  return commonPartBig
    .times(x)
    .plus(sqrtBig)
    .div(dividerBig)
    .round(0, 0)
    .plus(1); // +1 to offset rounding errors
}
