import BN from "bn.js";

export function amountToHex(amount: string): string {
  return "0x" + new BN(amount).toString("hex");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
