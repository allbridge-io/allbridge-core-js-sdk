import { Big } from "big.js";
import BN from "bn.js";
import { convertFloatAmountToInt, getD, getY } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";

export function depositAmountToVUsd(
  amount: string,
  aValue: string,
  dValue: string,
  tokenBalance: string,
  vUsdBalance: string,
  totalLpAmount: string
): string {
  const amountSP = convertFloatAmountToInt(amount, SYSTEM_PRECISION);
  const amountSPBig = Big(amountSP);
  const newTokenBalance = amountSPBig.plus(tokenBalance).toString();
  const newVUsdBalance = amountSPBig.plus(vUsdBalance).toString();
  const newD = getD(aValue, newTokenBalance, newVUsdBalance);
  const dDiff = Big(newD).minus(dValue);

  if (Big(dValue).eq(0) || Big(totalLpAmount).eq(0)) {
    return new BN(newD).shrn(1).toString();
  }
  return Big(totalLpAmount).times(dDiff).div(dValue).round().toFixed();
}

export function vUsdToWithdrawalAmount(
  lpAmount: string,
  aValue: string,
  dValue: string,
  tokenBalance: string,
  vUsdBalance: string,
  totalLpAmount: string
): string {
  const lpAmountSP = convertFloatAmountToInt(lpAmount, SYSTEM_PRECISION);
  const tokenBalanceBig = Big(tokenBalance);
  const vUsdBalanceBig = Big(vUsdBalance);

  const amountSP = preWithdrawSwap(
    tokenBalanceBig.times(lpAmountSP).div(totalLpAmount),
    vUsdBalanceBig.times(lpAmountSP).div(totalLpAmount),
    aValue,
    dValue,
    tokenBalance,
    vUsdBalance
  );
  return Big(amountSP).round().toFixed();
}

function preWithdrawSwap(
  amountToken: Big,
  amountVUsd: Big,
  aValue: string,
  dValue: string,
  tokenBalance: string,
  vUsdBalance: string
): string {
  if (amountToken.gt(amountVUsd)) {
    const extraToken = amountToken.minus(amountVUsd).div(2);
    const extraVUsd = Big(vUsdBalance).minus(getY(Big(tokenBalance).plus(extraToken).toFixed(), aValue, dValue));
    const amountTokenMinusExtraToken = amountToken.minus(extraToken);
    const amountVUsdPlusExtraVUsd = amountVUsd.plus(extraVUsd);
    return amountTokenMinusExtraToken.lte(amountVUsdPlusExtraVUsd)
      ? amountTokenMinusExtraToken.toFixed()
      : amountVUsdPlusExtraVUsd.toFixed();
  } else {
    const extraVUsd = amountVUsd.minus(amountToken).div(2);
    const extraToken = Big(tokenBalance).minus(getY(Big(vUsdBalance).plus(extraVUsd).toFixed(), aValue, dValue));
    const amountVUsdMinusExtraVUsd = amountVUsd.minus(extraVUsd);
    const amountTokenPlusExtraToken = amountToken.plus(extraToken);
    return amountVUsdMinusExtraVUsd.lte(amountTokenPlusExtraToken)
      ? amountVUsdMinusExtraVUsd.toFixed()
      : amountTokenPlusExtraToken.toFixed();
  }
}
