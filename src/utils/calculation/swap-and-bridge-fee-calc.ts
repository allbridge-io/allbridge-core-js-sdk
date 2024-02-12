import { Big, BigSource } from "big.js";
import { PoolInfo, Token } from "../../tokens-info";
import { fromSystemPrecision, getY, toSystemPrecision } from "./index";

export interface SwapPoolInfo {
  decimals: number;
  feeShare: string;
  poolInfo: PoolInfo;
}

export interface SwapAndBridgeCalculationData {
  swapToVUsdCalcResult: SwapToVUsdCalcResult;
  swapFromVUsdCalcResult: SwapFromVUsdCalcResult;
}

export interface SwapToVUsdCalcResult {
  bridgeFeeInTokenPrecision: string;
  amountIncludingCommissionInSystemPrecision: string;
  amountExcludingCommissionInSystemPrecision: string;
}
export interface SwapFromVUsdCalcResult {
  bridgeFeeInTokenPrecision: string;
  amountIncludingCommissionInTokenPrecision: string;
  amountExcludingCommissionInTokenPrecision: string;
}

export function swapAndBridgeFeeCalculation(
  amountInTokenPrecision: string,
  sourcePoolInfo: SwapPoolInfo,
  destinationPoolInfo: SwapPoolInfo
): SwapAndBridgeCalculationData {
  const swapToVUsdCalcResult = swapToVUsd(
    amountInTokenPrecision,
    { decimals: sourcePoolInfo.decimals, feeShare: sourcePoolInfo.feeShare },
    sourcePoolInfo.poolInfo
  );
  const swapFromVUsdCalcResult = swapFromVUsd(
    swapToVUsdCalcResult.amountIncludingCommissionInSystemPrecision,
    { decimals: destinationPoolInfo.decimals, feeShare: destinationPoolInfo.feeShare },
    destinationPoolInfo.poolInfo
  );
  return { swapToVUsdCalcResult, swapFromVUsdCalcResult };
}

export function swapAndBridgeFeeCalculationReverse(
  amountInTokenPrecision: string,
  sourcePoolInfo: SwapPoolInfo,
  destinationPoolInfo: SwapPoolInfo
): SwapAndBridgeCalculationData {
  const swapToVUsdCalcResult = swapToVUsdReverse(
    amountInTokenPrecision,
    { decimals: destinationPoolInfo.decimals, feeShare: destinationPoolInfo.feeShare },
    destinationPoolInfo.poolInfo
  );
  const swapFromVUsdCalcResult = swapFromVUsdReverse(
    swapToVUsdCalcResult.amountIncludingCommissionInSystemPrecision,
    { decimals: sourcePoolInfo.decimals, feeShare: sourcePoolInfo.feeShare },
    sourcePoolInfo.poolInfo
  );
  return {
    swapToVUsdCalcResult,
    swapFromVUsdCalcResult,
  };
}

function swapToVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "p" | "imbalance">
): SwapToVUsdCalcResult {
  const amountValue = Big(amount);
  const fee = amountValue.times(feeShare);
  const amountWithoutFee = amountValue.minus(fee);
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInSystemPrecision: calcSwapToVUsd(toSystemPrecision(amountWithoutFee, decimals), poolInfo),
    amountExcludingCommissionInSystemPrecision: calcSwapToVUsd(toSystemPrecision(amountValue, decimals), poolInfo),
  };
}

function calcSwapToVUsd(amountInSystemPrecision: Big, poolInfo: Omit<PoolInfo, "p" | "imbalance">): string {
  if (amountInSystemPrecision.eq(0)) {
    return "0";
  }
  const tokenBalance = Big(poolInfo.tokenBalance).plus(amountInSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance.toFixed(), poolInfo.aValue, poolInfo.dValue);
  return Big(poolInfo.vUsdBalance).minus(vUsdNewAmount).round().toFixed();
}

function swapFromVUsd(
  amount: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: Omit<PoolInfo, "imbalance">
): SwapFromVUsdCalcResult {
  if (Big(amount).eq(0)) {
    return {
      bridgeFeeInTokenPrecision: "0",
      amountIncludingCommissionInTokenPrecision: "0",
      amountExcludingCommissionInTokenPrecision: "0",
    };
  }
  const amountValue = Big(amount);
  const vUsdBalance = amountValue.plus(poolInfo.vUsdBalance);
  const newAmount = getY(vUsdBalance, poolInfo.aValue, poolInfo.dValue);
  const result = fromSystemPrecision(Big(poolInfo.tokenBalance).minus(newAmount), decimals);
  const fee = Big(result).times(feeShare);
  const resultWithoutFee = Big(result).minus(fee).round();
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInTokenPrecision: resultWithoutFee.toFixed(),
    amountExcludingCommissionInTokenPrecision: result.toFixed(),
  };
}

function swapToVUsdReverse(
  amountInTokenPrecision: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: PoolInfo
): SwapToVUsdCalcResult {
  const reversedFeeShare = Big(feeShare).div(Big(1).minus(feeShare));
  const fee = Big(amountInTokenPrecision).times(reversedFeeShare);
  const amountWithFee = Big(amountInTokenPrecision).plus(fee);
  return {
    bridgeFeeInTokenPrecision: fee.round().toFixed(),
    amountIncludingCommissionInSystemPrecision: calcSwapToVUsdReverse(
      toSystemPrecision(amountWithFee, decimals),
      poolInfo
    ),
    amountExcludingCommissionInSystemPrecision: calcSwapToVUsdReverse(
      toSystemPrecision(amountInTokenPrecision, decimals),
      poolInfo
    ),
  };
}

function calcSwapToVUsdReverse(amountInSystemPrecision: Big, poolInfo: PoolInfo): string {
  const tokenBalance = Big(poolInfo.tokenBalance).minus(amountInSystemPrecision);
  const vUsdNewAmount = getY(tokenBalance.toFixed(), poolInfo.aValue, poolInfo.dValue);
  return Big(vUsdNewAmount).minus(poolInfo.vUsdBalance).round().toFixed();
}

function swapFromVUsdReverse(
  amountInSystemPrecision: BigSource,
  { feeShare, decimals }: Pick<Token, "feeShare" | "decimals">,
  poolInfo: PoolInfo
): SwapFromVUsdCalcResult {
  if (Big(amountInSystemPrecision).eq(0)) {
    return {
      bridgeFeeInTokenPrecision: "0",
      amountIncludingCommissionInTokenPrecision: "0",
      amountExcludingCommissionInTokenPrecision: "0",
    };
  }
  const vUsdNewAmount = Big(poolInfo.vUsdBalance).minus(amountInSystemPrecision);
  const tokenBalance = getY(vUsdNewAmount.toFixed(), poolInfo.aValue, poolInfo.dValue);
  const inSystemPrecision = Big(tokenBalance).minus(poolInfo.tokenBalance);
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
