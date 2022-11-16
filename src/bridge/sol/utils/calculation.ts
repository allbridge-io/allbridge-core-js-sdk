/* eslint-disable-next-line  import/no-named-as-default */
import Big from "big.js";
import { PoolInfoDTO } from "../../../client/core-api/core-api.model";
import { toPowBase10 } from "../../../utils/calculation";
import { SYSTEM_PRECISION } from "../../../utils/calculation/constants";

export interface SwapToVUsdCalcResult {
  bridgeFeeInTokenPrecision: string;
  amountIncludingCommissionInSystemPrecision: string;
  amountExcludingCommissionInSystemPrecision: string;
}

export function swapToVUsd(
  amountInTokenPrecision: string,
  decimals: number,
  feeShare: string,
  poolInfo: PoolInfoDTO
): SwapToVUsdCalcResult {
  const fee = Big(amountInTokenPrecision).times(feeShare);
  const amountWithoutFee = Big(amountInTokenPrecision).minus(fee);

  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInSystemPrecision: calcSwapToVUsd(
      toSystemPrecision(amountWithoutFee.toFixed(), decimals),
      poolInfo
    ),
    amountExcludingCommissionInSystemPrecision: calcSwapToVUsd(
      toSystemPrecision(amountInTokenPrecision, decimals),
      poolInfo
    ),
  };
}

function calcSwapToVUsd(
  amountInSystemPrecision: string,
  poolInfo: PoolInfoDTO
): string {
  const tokenBalance = Big(poolInfo.tokenBalance).plus(amountInSystemPrecision);
  const vUsdNewAmount = getY(
    tokenBalance.toFixed(),
    poolInfo.aValue,
    poolInfo.dValue
  );
  return Big(poolInfo.vUsdBalance).minus(vUsdNewAmount).round().toFixed();
}

export function getY(x: string, a: string, d: string): string {
  const commonPartBig = Big(4).times(a).times(Big(d).minus(x)).minus(d);
  const dCubed = Big(d).pow(3);
  const commonPartSquared = commonPartBig.pow(2);
  const sqrtBig = Big(x)
    .times(Big(x).times(commonPartSquared).plus(Big(4).times(a).times(dCubed)))
    .sqrt();
  const dividerBig = Big(8).times(a).times(x);
  return commonPartBig.times(x).plus(sqrtBig).div(dividerBig).toFixed();
}

export function convertAmountPrecision(
  amount: string,
  decimalsFrom: number,
  decimalsTo: number
): string {
  const dif = Big(decimalsTo).minus(decimalsFrom).toNumber();
  return Big(amount).times(toPowBase10(dif)).toFixed();
}

export function toSystemPrecision(amount: string, decimals: number): string {
  return convertAmountPrecision(amount, decimals, SYSTEM_PRECISION);
}
