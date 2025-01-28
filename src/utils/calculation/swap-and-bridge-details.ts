import { Big } from "big.js";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";
import { convertIntAmountToFloat, fromSystemPrecision, swapFromVUsd, swapToVUsd } from "./index";

export interface SendAmountDetails {
  sourceLPSwap: AmountImpact;
  destLPSwap: AmountImpact;
}

export interface AmountImpact {
  fee: string;
  swap: string;
}

export function getSendAmountDetails(
  amountInTokenPrecision: string,
  sourceToken: TokenWithChainDetails,
  sourcePool: PoolInfo,
  destToken: TokenWithChainDetails,
  destPool: PoolInfo
): SendAmountDetails {
  const vUsd = swapToVUsd(amountInTokenPrecision, sourceToken, sourcePool);
  const vUsdInTokenPrecision = fromSystemPrecision(vUsd, sourceToken.decimals);
  const result = swapFromVUsd(vUsd, destToken, destPool);

  const swapToFeeInt = Big(amountInTokenPrecision).times(sourceToken.feeShare);
  const swapFromFeeInt = Big(result).div(Big(1).minus(destToken.feeShare)).minus(result);
  return {
    sourceLPSwap: {
      fee: convertIntAmountToFloat(swapToFeeInt, sourceToken.decimals)
        .neg()
        .round(sourceToken.decimals, Big.roundUp)
        .toFixed(),
      swap: convertIntAmountToFloat(
        Big(amountInTokenPrecision).minus(vUsdInTokenPrecision).minus(swapToFeeInt),
        sourceToken.decimals
      )
        .neg()
        .round(sourceToken.decimals, Big.roundUp)
        .toFixed(),
    },
    destLPSwap: {
      fee: convertIntAmountToFloat(swapFromFeeInt, destToken.decimals)
        .neg()
        .round(destToken.decimals, Big.roundUp)
        .toFixed(),
      swap: convertIntAmountToFloat(
        fromSystemPrecision(vUsd, destToken.decimals).minus(result).minus(swapFromFeeInt),
        destToken.decimals
      )
        .neg()
        .round(destToken.decimals, Big.roundUp)
        .toFixed(),
    },
  };
}
