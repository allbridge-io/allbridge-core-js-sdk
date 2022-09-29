import { Big } from "big.js";
import { describe, expect, test } from "vitest";
import { TokenInfo } from "../../tokens-info";
import {
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd,
  swapFromVUsdReverse,
  swapToVUsd,
  swapToVUsdReverse,
  toSystemPrecision,
} from "../../utils/calculation";

describe("Calculation", () => {
  describe("Convert float amount to int", () => {
    test.each([
      ["1", 5, Big(100_000)],
      ["10", 5, Big(1_000_000)],
      ["10000000000", 5, Big(1_000_000_000_000_000)],
      ["1.5", 5, Big(150_000)],
      ["0.5", 5, Big(50_000)],
      [".5", 5, Big(50_000)],
      ["0.05", 5, Big(5_000)],
      ["0.100000", 5, Big(10_000)],
      ["0.1000005", 5, Big(10_000.05)],
    ])(
      "☀️ Convert %s to int with decimals %d -> %s",
      (amountFloat, decimals, expectedAmountInt) => {
        expect(convertFloatAmountToInt(amountFloat, decimals)).toStrictEqual(
          expectedAmountInt
        );
      }
    );

    test.each([
      ["0", 5, Big(0)],
      ["100000", 5, Big(1)],
      ["1000000", 5, Big(10)],
      ["1000000000000000", 5, Big(10_000_000_000)],
      ["10500", 5, Big(0.105)],
      ["1050000000", 5, Big(10500)],
    ])(
      "☀️ Convert %s to float with decimals %d -> %s",
      (amountInt, decimals, expectedAmountFloat) => {
        expect(convertIntAmountToFloat(amountInt, decimals)).toStrictEqual(
          expectedAmountFloat
        );
      }
    );
  });

  describe("Convert precision", () => {
    test.each([
      [100_000, 5, Big(1_000)],
      [100_000, 10, Big(0)],
      [100_000_000_000_000_000_000, 3, Big(100_000_000_000_000_000_000)],
      [100_000_000_000_000_000_000, 18, Big(100_000)],
      [1, 2, Big(10)],
      [0, 1, Big(0)],
    ])(
      "☀️ Convert %d with decimals %d to system precision -> %s",
      (amount, decimals, expectedSystemPrecisionAmount) => {
        expect(toSystemPrecision(amount, decimals)).toStrictEqual(
          expectedSystemPrecisionAmount
        );
      }
    );

    test.each([
      [1_000, 5, Big(100_000)],
      [10, 1, Big(0)],
      [100_000_000_000_000_000_000, 3, Big(100_000_000_000_000_000_000)],
      [100_000, 18, Big(100_000_000_000_000_000_000)],
      [10, 2, Big(1)],
      [0, 1, Big(0)],
    ])(
      "☀️ Convert %d from system precision to amount with decimals %d -> %s",
      (systemPrecisionAmount, decimals, expectedAmount) => {
        expect(
          fromSystemPrecision(systemPrecisionAmount, decimals)
        ).toStrictEqual(expectedAmount);
      }
    );
  });

  describe("Get fee percent", () => {
    test.each([
      [100, 99.5, 0.5],
      [200, 199, 0.5],
      [199, 200, -0.5],
      [100, 50, 50],
      [50, 100, -100],
    ])(
      "☀️ Get fee percent from input %d and output %d -> %d%%",
      (input, output, expectedPercent) => {
        expect(getFeePercent(input, output)).toStrictEqual(expectedPercent);
      }
    );
  });

  describe("VUsd calculation", () => {
    const basicTokenInfo = {
      symbol: "symbol",
      name: "name",
      poolAddress: "poolAddress",
      tokenAddress: "tokenAddress",
      apr: 0,
      lpRate: 0,
    };

    test.each([
      [100, 0, "100000", "100000", 0.00009],
      [10_000, 2, "100000", "100000", 0.00009],
    ])(
      "☀️ swapToVUsd amount: %d decimals: %d tokenBalance: %d, vUsdBalance: %d -> %d",
      (amount, decimals: number, tokenBalance, vUsdBalance, expectedAmount) => {
        const token: TokenInfo = {
          ...basicTokenInfo,
          decimals: decimals,
          feeShare: "0",
          poolInfo: {
            dValue: "200000",
            aValue: "20",
            vUsdBalance: vUsdBalance,
            tokenBalance: tokenBalance,
            totalLpAmount: "",
            accRewardPerShareP: "",
          },
        };
        expect(swapToVUsd(amount, token).div(1e9)).toBeCloseTo(
          expectedAmount,
          1e-3
        );
      }
    );

    test.each([
      [100_000, 0, "100000", "100000", 90],
      [100_000, 2, "100000", "100000", 9000],
    ])(
      "☀️ swapFromVUsd amount: %d decimals: %d tokenBalance: %d, vUsdBalance: %d -> %d",
      (amount, decimals: number, tokenBalance, vUsdBalance, expectedAmount) => {
        const token: TokenInfo = {
          ...basicTokenInfo,
          decimals: decimals,
          feeShare: "0",
          poolInfo: {
            dValue: "200000",
            aValue: "20",
            vUsdBalance: vUsdBalance,
            tokenBalance: tokenBalance,
            totalLpAmount: "",
            accRewardPerShareP: "",
          },
        };
        expect(swapFromVUsd(amount, token)).toStrictEqual(Big(expectedAmount));
      }
    );

    test.each([
      [90_000, 0, "100000", "100000", 100],
      [90_000, 2, "100000", "100000", 10_000],
    ])(
      "☀️ swapToVUsdReverse amount: %d decimals: %d tokenBalance: %d, vUsdBalance: %d -> %d",
      (amount, decimals: number, tokenBalance, vUsdBalance, expectedAmount) => {
        const token: TokenInfo = {
          ...basicTokenInfo,
          decimals: decimals,
          feeShare: "0",
          poolInfo: {
            dValue: "200000",
            aValue: "20",
            vUsdBalance: vUsdBalance,
            tokenBalance: tokenBalance,
            totalLpAmount: "",
            accRewardPerShareP: "",
          },
        };
        expect(swapToVUsdReverse(amount, token)).toStrictEqual(
          Big(expectedAmount)
        );
      }
    );

    test.each([
      [90, 0, "100000", "100000", 100_000],
      [9000, 2, "100000", "100000", 100_000],
    ])(
      "☀️ swapFromVUsdReverse amount: %d decimals: %d tokenBalance: %d, vUsdBalance: %d -> %d",
      (amount, decimals: number, tokenBalance, vUsdBalance, expectedAmount) => {
        const token: TokenInfo = {
          ...basicTokenInfo,
          decimals: decimals,
          feeShare: "0",
          poolInfo: {
            dValue: "200000",
            aValue: "20",
            vUsdBalance: vUsdBalance,
            tokenBalance: tokenBalance,
            totalLpAmount: "",
            accRewardPerShareP: "",
          },
        };
        expect(swapFromVUsdReverse(amount, token)).toStrictEqual(
          Big(expectedAmount)
        );
      }
    );
  });
});
