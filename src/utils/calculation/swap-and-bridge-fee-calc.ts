import { Pool } from "../../tokens-info";
import {
  swapFromVUsd,
  SwapFromVUsdCalcResult,
  swapFromVUsdReverse,
  swapToVUsd,
  SwapToVUsdCalcResult,
  swapToVUsdReverse,
} from "./index";

export interface SwapPoolInfo {
  decimals: number;
  feeShare: string;
  pool: Pool;
}

export interface SwapAndBridgeCalculationData {
  swapToVUsdCalcResult: SwapToVUsdCalcResult;
  swapFromVUsdCalcResult: SwapFromVUsdCalcResult;
}

export function swapAndBridgeFeeCalculation(
  amountInTokenPrecision: string,
  sourcePoolInfo: SwapPoolInfo,
  destinationPoolInfo: SwapPoolInfo
): SwapAndBridgeCalculationData {
  const swapToVUsdCalcResult = swapToVUsd(
    amountInTokenPrecision,
    { decimals: sourcePoolInfo.decimals, feeShare: sourcePoolInfo.feeShare },
    sourcePoolInfo.pool
  );
  const swapFromVUsdCalcResult = swapFromVUsd(
    swapToVUsdCalcResult.amountIncludingCommissionInSystemPrecision,
    { decimals: destinationPoolInfo.decimals, feeShare: destinationPoolInfo.feeShare },
    destinationPoolInfo.pool
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
    destinationPoolInfo.pool
  );
  const swapFromVUsdCalcResult = swapFromVUsdReverse(
    swapToVUsdCalcResult.amountIncludingCommissionInSystemPrecision,
    { decimals: sourcePoolInfo.decimals, feeShare: sourcePoolInfo.feeShare },
    sourcePoolInfo.pool
  );
  return {
    swapToVUsdCalcResult,
    swapFromVUsdCalcResult,
  };
}
