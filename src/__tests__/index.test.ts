import { beforeEach, describe, expect, test, it } from "vitest";
import { AllbridgeCoreSdk } from "../index";
import { TokenInfo } from "../tokens-info";

const basicTokenInfo = {
  symbol: "symbol",
  name: "name",
  poolAddress: "poolAddress",
  tokenAddress: "tokenAddress",
  apr: 0,
  lpRate: 0,
};

describe("SDK", () => {
  let sdk: AllbridgeCoreSdk;

  beforeEach(() => {
    sdk = new AllbridgeCoreSdk({ apiUrl: "http://localhost" });
  });

  describe("Fee percent", () => {
    const sourceChainToken: TokenInfo = {
      ...basicTokenInfo,
      decimals: 18,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "20000000",
        vUsdBalance: "10000000",
        tokenBalance: "10000000",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };

    const destinationChainToken: TokenInfo = {
      ...basicTokenInfo,
      decimals: 18,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "20000000",
        vUsdBalance: "10000000",
        tokenBalance: "10000000",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };

    describe("calculateFeesPercentOnSourceChain", () => {
      test.each([
        [10, 0.01],
        [10_000, 10],
      ])(
        "☀️ should return fee percent for amount: %d -> %d%%",
        (amountFloat, expectedPercent) => {
          const actual = sdk.calculateFeePercentOnSourceChain(
            amountFloat,
            sourceChainToken
          );
          expect(actual).toEqual(expectedPercent);
        }
      );
      it("☁ should return for amount: 0 -> 0%", () => {
        const actual = sdk.calculateFeePercentOnSourceChain(
          0,
          sourceChainToken
        );
        expect(actual).toEqual(0);
      });
    });

    describe("calculateFeePercentOnDestinationChain", () => {
      test.each([[2_000, 0.5017049502344747]])(
        "☀️ should return fee percent for amount: %d -> %d%%",
        (amountFloat, expectedPercent) => {
          const actual = sdk.calculateFeePercentOnDestinationChain(
            amountFloat,
            sourceChainToken,
            destinationChainToken
          );
          expect(actual).toBeCloseTo(expectedPercent, 16);
        }
      );
      it("☁ should return for amount: 0 -> 0%", () => {
        const actual = sdk.calculateFeePercentOnDestinationChain(
          0,
          sourceChainToken,
          destinationChainToken
        );
        expect(actual).toEqual(0);
      });
    });
  });
});
