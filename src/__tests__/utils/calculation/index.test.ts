import { Big } from "big.js";
import { Token } from "../../../tokens-info";
import {
  aprInPercents,
  convertFloatAmountToInt,
  convertIntAmountToFloat,
  fromSystemPrecision,
  getFeePercent,
  swapFromVUsd,
  swapToVUsd,
  toSystemPrecision,
} from "../../../utils/calculation";

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
      ["9.999999999999999999", 18, Big("9999999999999999999")],
    ])("☀️ Convert %s to int with decimals %d -> %s", (amountFloat, decimals, expectedAmountInt) => {
      expect(convertFloatAmountToInt(amountFloat, decimals)).toStrictEqual(expectedAmountInt);
    });

    test.each([
      ["0", 5, Big(0)],
      ["100000", 5, Big(1)],
      ["1000000", 5, Big(10)],
      ["1000000000000000", 5, Big(10_000_000_000)],
      ["10500", 5, Big(0.105)],
      ["1050000000", 5, Big(10500)],
    ])("☀️ Convert %s to float with decimals %d -> %s", (amountInt, decimals, expectedAmountFloat) => {
      expect(convertIntAmountToFloat(amountInt, decimals)).toStrictEqual(expectedAmountFloat);
    });
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
        expect(toSystemPrecision(amount, decimals)).toStrictEqual(expectedSystemPrecisionAmount);
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
        expect(fromSystemPrecision(systemPrecisionAmount, decimals)).toStrictEqual(expectedAmount);
      }
    );
  });

  describe("Get fee percent", () => {
    test.each([
      [100, 99.5, 0.5],
      [200, 199, 0.5],
      [200, 201, -0.5],
      [100, 50, 50],
      [50, 100, -100],
    ])("☀️ Get fee percent from input %d and output %d -> %d%%", (input, output, expectedPercent) => {
      expect(getFeePercent(input, output)).toStrictEqual(expectedPercent);
    });
  });

  describe("Swap calculation", () => {
    const basicTokenInfo = {
      symbol: "symbol",
      name: "name",
      poolAddress: "poolAddress",
      tokenAddress: "tokenAddress",
      apr: 0,
      lpRate: 0,
    };

    describe("Given token with a balanced poolInfo", () => {
      const token: Token = {
        ...basicTokenInfo,
        decimals: 18,
        feeShare: "0",
      };
      const pool = {
        aValue: "20",
        dValue: "2000000000001",
        tokenBalance: "1000000000000",
        vUsdBalance: "1000000000000",
        totalLpAmount: "",
        accRewardPerShareP: "",
        p: 0,
      };

      test.each([
        [30000000000000000, 28],
        [1000000000000000000000, 999998],
      ])("☀️ swapToVUsd amount: %s -> %d", (amount, expectedAmount) => {
        expect(Big(swapToVUsd(amount, token, pool).amountIncludingCommissionInSystemPrecision)).toEqual(
          Big(expectedAmount)
        );
      });

      test.each([
        [28, 26000000000000000],
        [999998, 999996000000000000000],
      ])("☀️ swapFromVUsd amount: %d -> %d", (amount, expectedAmount) => {
        expect(Big(swapFromVUsd(amount, token, pool).amountIncludingCommissionInTokenPrecision)).toEqual(
          Big(expectedAmount)
        );
      });
    });

    describe("Given token with more vUsd in the poolInfo", () => {
      const token: Token = {
        ...basicTokenInfo,
        decimals: 18,
        feeShare: "0",
      };
      const pool = {
        aValue: "20",
        dValue: "2000000000001",
        tokenBalance: "100000000001",
        vUsdBalance: "2000000000000",
        totalLpAmount: "",
        accRewardPerShareP: "",
        p: 0,
      };

      test("☀️ swapToVUsd near-zero amount", () => {
        expect(Big(swapToVUsd(10000000000000000, token, pool).amountIncludingCommissionInSystemPrecision)).toEqual(
          Big(22)
        );
      });

      test("☀️ swapFromVUsd near-zero amount", () => {
        expect(Big(swapFromVUsd(22, token, pool).amountIncludingCommissionInTokenPrecision)).toEqual(
          Big(10000000000000000)
        );
      });
    });

    describe("Given token with more tokens in the poolInfo", () => {
      const token: Token = {
        ...basicTokenInfo,
        decimals: 18,
        feeShare: "0",
      };
      const pool = {
        aValue: "20",
        dValue: "2000000000001",
        tokenBalance: "2000000000000",
        vUsdBalance: "100000000001",
        totalLpAmount: "",
        accRewardPerShareP: "",
        p: 0,
      };

      test.each([
        [1, 0],
        [10000000000000000, 5],
      ])("☀️ swapToVUsd amount: %d -> %d", (amount, expectedAmount) => {
        expect(Big(swapToVUsd(amount, token, pool).amountIncludingCommissionInSystemPrecision)).toEqual(
          Big(expectedAmount)
        );
      });

      test.each([
        [0, 0],
        [5, 11000000000000000],
      ])("☀️ swapFromVUsd amount: %d -> %d", (amount, expectedAmount) => {
        expect(Big(swapFromVUsd(amount, token, pool).amountIncludingCommissionInTokenPrecision)).toEqual(
          Big(expectedAmount)
        );
      });
    });

    describe("Given tokens with fee", () => {
      const sourceToken: Token = {
        ...basicTokenInfo,
        decimals: 18,
        feeShare: "0.003",
      };
      const sourcePoolInfo = {
        aValue: "20",
        dValue: "200000001",
        tokenBalance: "100166280",
        vUsdBalance: "99833728",
        totalLpAmount: "",
        accRewardPerShareP: "",
        p: 0,
      };

      const destinationToken: Token = {
        ...basicTokenInfo,
        decimals: 18,
        feeShare: "0.003",
      };
      const destinationPoolInfo = {
        aValue: "20",
        dValue: "200000001",
        tokenBalance: "99738849",
        vUsdBalance: "100261169",
        totalLpAmount: "",
        accRewardPerShareP: "",
        p: 0,
      };

      test("☀️ swapToVUsd 10 tokens", () => {
        expect(
          Big(swapToVUsd(10000000000000000000, sourceToken, sourcePoolInfo).amountIncludingCommissionInSystemPrecision)
        ).toEqual(Big(9969));
      });

      test("☀️ swapFromVUsd almost 10 tokens", () => {
        expect(
          Big(swapFromVUsd(9969, destinationToken, destinationPoolInfo).amountIncludingCommissionInTokenPrecision)
        ).toEqual(Big(9938096000000000000));
      });
    });
  });

  describe("aprInPercents", () => {
    test("convert apr to percent view", () => {
      expect(aprInPercents(0.1256)).toEqual("12.56%");
    });
    test("invalid apr to percent view", () => {
      expect(aprInPercents(0)).toEqual("N/A");
      expect(aprInPercents(-1)).toEqual("N/A");
    });
  });
});
