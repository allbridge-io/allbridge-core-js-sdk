import { AllbridgeCoreClientPoolInfoCaching } from "../client/core-api/core-client-pool-info-caching";
import { ArgumentInvalidDecimalsError } from "../exceptions";
import { TokenWithChainDetails } from "../tokens-info";

export async function getPoolInfoByToken(
  api: AllbridgeCoreClientPoolInfoCaching,
  sourceChainToken: TokenWithChainDetails
) {
  return await api.getPoolInfoByKey({
    chainSymbol: sourceChainToken.chainSymbol,
    poolAddress: sourceChainToken.poolAddress,
  });
}

export function validateAmountDecimals(argName: string, amountFloat: string, decimalRequired: number) {
  if (amountFloat.split(".").length == 2 && amountFloat.split(".")[1].length > decimalRequired) {
    throw new ArgumentInvalidDecimalsError(argName, amountFloat.split(".")[1].length, decimalRequired);
  }
}
