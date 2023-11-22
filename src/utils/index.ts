import { Big, BigSource } from "big.js";
import { AllbridgeCoreClientPoolInfoCaching } from "../client/core-api/core-client-pool-info-caching";
import { ArgumentInvalidDecimalsError, InvalidAmountError, TimeoutError } from "../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../tokens-info";

export async function getPoolInfoByToken(
  api: AllbridgeCoreClientPoolInfoCaching,
  sourceChainToken: TokenWithChainDetails
): Promise<PoolInfo> {
  return await api.getPoolInfoByKey({
    chainSymbol: sourceChainToken.chainSymbol,
    poolAddress: sourceChainToken.poolAddress,
  });
}

export function validateAmountGtZero(amount: BigSource) {
  if (Big(amount).lte(0)) {
    throw new InvalidAmountError("Amount must be greater than zero");
  }
}

export function validateAmountDecimals(argName: string, amountFloat: number | string | Big, decimalRequired: number) {
  const amount = Big(amountFloat).toFixed();
  if (amount.split(".").length == 2 && amount.split(".")[1].length > decimalRequired) {
    throw new ArgumentInvalidDecimalsError(argName, amount.split(".")[1].length, decimalRequired);
  }
}

export async function promiseWithTimeout<T>(promise: Promise<T>, msg: string, timeoutMs: number): Promise<T> {
  return (await Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new TimeoutError(msg)), timeoutMs);
    }),
  ])) as any as T;
}
