import { BigSource } from "big.js";
import {
  toSystemPrecision as toSystemPrecisionBig,
  fromSystemPrecision as fromSystemPrecisionBig,
  convertIntAmountToFloat as convertIntAmountToFloatBig,
  convertFloatAmountToInt as convertFloatAmountToIntBig,
} from "./index";

export function toSystemPrecision(amountInt: BigSource, decimals: number): string {
  return toSystemPrecisionBig(amountInt, decimals).toFixed();
}

export function fromSystemPrecision(amountInt: BigSource, decimals: number): string {
  return fromSystemPrecisionBig(amountInt, decimals).toFixed();
}

export function convertFloatAmountToInt(amountFloat: BigSource, decimals: number): string {
  return convertFloatAmountToIntBig(amountFloat, decimals).toFixed();
}

export function convertIntAmountToFloat(amountInt: BigSource, decimals: number): string {
  return convertIntAmountToFloatBig(amountInt, decimals).toFixed();
}
