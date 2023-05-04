import { Big } from "big.js";
import { convertFloatAmountToInt, getD } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";

export function depositAmountToVUsd(
  amount: string,
  aValue: string,
  dValue: string,
  tokenBalance: string,
  vUsdBalance: string
): string {
  const amountSP = convertFloatAmountToInt(amount, SYSTEM_PRECISION);
  const amountSPBig = Big(amountSP);

  const oldD = Big(getD(aValue, tokenBalance, vUsdBalance));
  const oldBalance = Big(tokenBalance).plus(vUsdBalance);

  let newTokenBalance;
  let newVUsdBalance;

  if (oldD.eq(0) || oldBalance.eq(0)) {
    const halfAmount = amountSPBig.div(2);
    newTokenBalance = Big(tokenBalance).plus(halfAmount);
    newVUsdBalance = Big(vUsdBalance).plus(halfAmount);
  } else {
    newTokenBalance = Big(tokenBalance).plus(amountSPBig.mul(tokenBalance).div(oldBalance));
    newVUsdBalance = Big(vUsdBalance).plus(amountSPBig.mul(vUsdBalance).div(oldBalance));
  }
  const newD = Big(getD(aValue, newTokenBalance.toString(), newVUsdBalance.toString()));
  return newD.minus(oldD).toString();
}

export function vUsdToWithdrawalAmount(lpAmount: string): string {
  const lpAmountSP = convertFloatAmountToInt(lpAmount, SYSTEM_PRECISION);
  return Big(lpAmountSP).round().toFixed();
}
