import { Big } from "big.js";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";
import { convertIntAmountToFloat, fromSystemPrecision, swapFromVUsd, swapToVUsd } from "./index";

export interface SwapAndBridgeDetails {
  swapTo: FeeAndSwapImpact;
  swapFrom: FeeAndSwapImpact;
}

export interface FeeAndSwapImpact {
  fee: string;
  swap: string;
}

export function swapAndBridgeDetails(
  amountInTokenPrecision: string,
  sourceToken: TokenWithChainDetails,
  sourcePool: PoolInfo,
  destToken: TokenWithChainDetails,
  destPool: PoolInfo
): SwapAndBridgeDetails {
  const vUsd = swapToVUsd(amountInTokenPrecision, sourceToken, sourcePool);
  const vUsdInTokenPrecision = fromSystemPrecision(vUsd, sourceToken.decimals);
  const result = swapFromVUsd(vUsd, destToken, destPool);

  const swapToFeeInt = Big(amountInTokenPrecision).times(sourceToken.feeShare);
  const swapFromFeeInt = Big(result).div(Big(1).minus(destToken.feeShare)).minus(result);
  return {
    swapTo: {
      fee: convertIntAmountToFloat(swapToFeeInt, sourceToken.decimals).neg().round(sourceToken.decimals, 3).toFixed(),
      swap: convertIntAmountToFloat(
        Big(amountInTokenPrecision).minus(vUsdInTokenPrecision).minus(swapToFeeInt),
        sourceToken.decimals
      )
        .neg()
        .round(sourceToken.decimals, 3)
        .toFixed(),
    },
    swapFrom: {
      fee: convertIntAmountToFloat(swapFromFeeInt, destToken.decimals).neg().round(destToken.decimals, 3).toFixed(),
      swap: convertIntAmountToFloat(
        fromSystemPrecision(vUsd, destToken.decimals).minus(result).minus(swapFromFeeInt),
        destToken.decimals
      )
        .neg()
        .round(destToken.decimals, 3)
        .toFixed(),
    },
  };
}
