import { beforeEach, describe, expect, it, test } from "vitest";
import { ChainType } from "../chains";
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  TokenInfoWithChainDetails,
} from "../index";
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

  describe("Given transfer parameters", () => {
    const sourceChainDetails = {
      chainSymbol: ChainSymbol.GRL,
      chainId: "0x5",
      chainName: "Goerli",
      chainType: ChainType.EVM,
      allbridgeChainId: 2,
      bridgeAddress: "bridgeAddress",
      confirmations: 5,
      txTime: {
        [Messenger.ALLBRIDGE]: {
          in: 30000,
          out: 120000,
        },
      },
    };
    const destinationChainDetails = {
      chainSymbol: ChainSymbol.RPS,
      chainId: "0x3",
      chainName: "Ropsten",
      chainType: ChainType.EVM,
      allbridgeChainId: 3,
      bridgeAddress: "bridgeAddress",
      confirmations: 5,
      txTime: {
        [Messenger.ALLBRIDGE]: {
          in: 30000,
          out: 120000,
        },
      },
    };

    const sourceChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfo,
      ...sourceChainDetails,
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

    const destinationChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfo,
      ...destinationChainDetails,
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

    describe("getAverageTransferTime", () => {
      it("☀ should return 150 sec -> 150000", () => {
        const actual = sdk.getAverageTransferTime(
          sourceChainToken,
          destinationChainToken,
          Messenger.ALLBRIDGE
        );
        expect(actual).toEqual(150_000);
      });

      describe("given unsupported messenger", () => {
        const unsupportedMessenger = 999;

        it("☁ should return null -> null", () => {
          const actual = sdk.getAverageTransferTime(
            sourceChainToken,
            destinationChainToken,
            unsupportedMessenger
          );
          expect(actual).toBeNull();
        });
      });
    });
  });
});
