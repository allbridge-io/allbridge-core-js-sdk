import { beforeEach, describe, expect, test } from "vitest";
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

    test.each([
      [10, 0.01],
      [10_000, 10],
    ])(
      "☀️ calculateFeesPercentOnSourceChain amount: %d -> %d%%",
      (amountFloat, expectedPercent) => {
        const actual = sdk.calculateFeesPercentOnSourceChain(
          amountFloat,
          sourceChainToken
        );
        expect(actual).toEqual(expectedPercent);
      }
    );

    test.each([[2000, 0.5]])(
      "☀️ calculateFeesPercentOnDestinationChain amount: %d -> %d%%",
      (amountFloat, expectedPercent) => {
        const actual = sdk.calculateFeesPercentOnDestinationChain(
          amountFloat,
          sourceChainToken,
          destinationChainToken
        );
        expect(actual).toEqual(expectedPercent);
      }
    );
  });
});
