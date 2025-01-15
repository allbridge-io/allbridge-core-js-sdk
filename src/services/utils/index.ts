import BN from "bn.js";

export function amountToHex(amount: string): string {
  return "0x" + new BN(amount).toString("hex");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export const promisify =
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (func: Function) =>
    (...args: any[]) =>
      new Promise<any>(
        (resolve, reject) =>
          func(...args, (err: Error, result: any) => (err ? reject(err) : resolve(result)))
      );
