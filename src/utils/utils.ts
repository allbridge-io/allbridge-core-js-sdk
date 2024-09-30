import { Big, BigSource } from "big.js";
import { AllbridgeCoreClientPoolsExt } from "../client/core-api/core-client-pool-info-caching";
import { ArgumentInvalidDecimalsError, InvalidAmountError, TimeoutError } from "../exceptions";
import { PoolInfo, TokenWithChainDetails } from "../tokens-info";

export async function getPoolInfoByToken(
  api: AllbridgeCoreClientPoolsExt,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [integerPart, fractionalPart] = amount.split(".");

  if (fractionalPart && fractionalPart.length > decimalRequired) {
    throw new ArgumentInvalidDecimalsError(argName, fractionalPart.length, decimalRequired);
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

export async function promiseWithTimeoutAndRetries<T>(
  toTry: () => Promise<T>,
  msg: string,
  maxRetries: number,
  timeoutMs: number
): Promise<T> {
  if (maxRetries < 1)
    throw new Error(`Bad argument: 'maxRetries' must be greater than 0, but ${maxRetries} was received.`);
  let attemptCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
  while (true) {
    try {
      return await promiseWithTimeout(toTry(), msg, timeoutMs);
    } catch (error) {
      if (++attemptCount >= maxRetries) throw new TimeoutError(msg);
    }
  }
}

/**
 * Keep calling a `fn` for `secondsToWait` seconds, if `keepWaitingIf` is true.
 * Returns an array of all attempts to call the function.
 */
export async function withExponentialBackoff<T>(
  fn: (previousFailure?: T) => Promise<T>,
  keepWaitingIf: (result: T) => boolean,
  secondsToWait: number,
  exponentialFactor = 1.5,
  verbose = false
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  const initialAttempt = await fn();
  attempts.push(initialAttempt);
  if (!keepWaitingIf(initialAttempt)) return attempts;

  const waitUntil = new Date(Date.now() + secondsToWait * 1000).valueOf();
  let waitTime = 1000;
  let totalWaitTime = waitTime;

  while (Date.now() < waitUntil) {
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt === undefined || !keepWaitingIf(lastAttempt)) break;

    count++;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          secondsToWait * 1000
        }ms)`
      );
    }
    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime = waitTime * exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again
    const nextAttempt = await fn(lastAttempt);
    attempts.push(nextAttempt);
    if (verbose && keepWaitingIf(nextAttempt)) {
      console.info(
        `${count}. Called ${fn.name}; ${attempts.length} prev attempts. Most recent: ${JSON.stringify(
          attempts[attempts.length - 1],
          null,
          2
        )}`
      );
    }
  }

  return attempts;
}
