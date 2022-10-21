import { beforeEach, describe, expect, test } from "vitest";
import {
  AllbridgeCoreSdk,
  Messenger,
  TokenInfoWithChainDetails,
} from "../index";

import { getFeePercent } from "../utils/calculation";
import tokenInfoList from "./data/tokens-info/TokenInfoWithChainDetails.json";

const basicTokenInfoWithChainDetails =
  tokenInfoList[1] as unknown as TokenInfoWithChainDetails;

describe("SDK", () => {
  let sdk: AllbridgeCoreSdk;

  beforeEach(() => {
    sdk = new AllbridgeCoreSdk({ apiUrl: "http://localhost" });
  });

  describe("Given tokens with different precision", () => {
    const sourceChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 18,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "200001",
        tokenBalance: "100000",
        vUsdBalance: "100000",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };
    const destinationChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 6,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "200001",
        tokenBalance: "100000",
        vUsdBalance: "100000",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };

    const amountToSend = "100";
    const amountToReceive = "84.18";

    test(`☀ getAmountToBeReceived for ${amountToSend} should return -> ${amountToReceive}`, () => {
      const actual = sdk.getAmountToBeReceived(
        amountToSend,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toEqual(amountToReceive);
    });

    test(`☀ getAmountToSend for ${amountToReceive} should return -> ${amountToSend}`, () => {
      const actual = sdk.getAmountToSend(
        amountToReceive,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toBeCloseTo(+amountToSend, 2);
    });
  });

  describe("Given tokens with imbalanced pool", () => {
    const sourceChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 6,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "204253",
        tokenBalance: "17684",
        vUsdBalance: "191863",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };
    const destinationChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 18,
      feeShare: "0",
      poolInfo: {
        aValue: "20",
        dValue: "206649",
        tokenBalance: "202486",
        vUsdBalance: "12487",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };

    const amountToSend = "84.16";
    const amountToReceive = "97.776";

    test(`☀ getAmountToBeReceived for ${amountToSend} should return -> ${amountToReceive}`, () => {
      const actual = sdk.getAmountToBeReceived(
        amountToSend,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toEqual(amountToReceive);
    });

    test(`☀ getAmountToSend for ${amountToReceive} should return -> ${amountToSend}`, () => {
      const actual = sdk.getAmountToSend(
        amountToReceive,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toBeCloseTo(+amountToSend, 2);
    });
  });

  describe("Given tokens with fee", () => {
    const sourceChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 18,
      feeShare: "0.003",
      poolInfo: {
        aValue: "20",
        dValue: "200000001",
        tokenBalance: "100166280",
        vUsdBalance: "99833728",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };
    const destinationChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 18,
      feeShare: "0.003",
      poolInfo: {
        aValue: "20",
        dValue: "200000001",
        tokenBalance: "99738849",
        vUsdBalance: "100261169",
        totalLpAmount: "",
        accRewardPerShareP: "",
      },
    };

    const amountToSend = "10";
    const vUsd = 9.969;
    const amountToReceive = "9.938096";

    test(`☀ getAmountToBeReceived for amount ${amountToSend} should return -> ${amountToReceive}`, () => {
      const actual = sdk.getAmountToBeReceived(
        amountToSend,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toEqual(amountToReceive);
    });

    test(`☀ getAmountToSend for amount ${amountToReceive} should return -> ${amountToSend}`, () => {
      const actual = sdk.getAmountToSend(
        amountToReceive,
        sourceChainToken,
        destinationChainToken
      );
      expect(actual).toEqual(amountToSend);
    });

    describe("calculateFeesPercentOnSourceChain", () => {
      const expectedPercent = getFeePercent(amountToSend, vUsd);
      test(`☀️ should return fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, () => {
        const actual = sdk.calculateFeePercentOnSourceChain(
          amountToSend,
          sourceChainToken
        );
        expect(actual).toEqual(expectedPercent);
      });

      test("☁ calculateFeePercentOnSourceChain should return for amount: 0 -> 0%", () => {
        const actual = sdk.calculateFeePercentOnSourceChain(
          0,
          sourceChainToken
        );
        expect(actual).toEqual(0);
      });
    });

    describe("calculateFeePercentOnDestinationChain", () => {
      const expectedPercent = getFeePercent(vUsd, amountToReceive);
      test(`☀️ should return fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, () => {
        const actual = sdk.calculateFeePercentOnDestinationChain(
          amountToSend,
          sourceChainToken,
          destinationChainToken
        );
        expect(actual).toBeCloseTo(expectedPercent, 2);
      });

      test("☁ should return for amount: 0 -> 0%", () => {
        const actual = sdk.calculateFeePercentOnDestinationChain(
          0,
          sourceChainToken,
          destinationChainToken
        );
        expect(actual).toEqual(0);
      });
    });

    describe("calculate total fee", () => {
      const expectedPercent = getFeePercent(amountToSend, amountToReceive);

      test(`☀️ calculated source and destination fees should match total fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, () => {
        const feePercentOnSource = sdk.calculateFeePercentOnSourceChain(
          amountToSend,
          sourceChainToken
        );
        const feePercentOnDestination =
          sdk.calculateFeePercentOnDestinationChain(
            amountToSend,
            sourceChainToken,
            destinationChainToken
          );
        const partAfterFeeOnSource = 1 - feePercentOnSource / 100;
        const partAfterFeeOnDestination =
          partAfterFeeOnSource -
          (partAfterFeeOnSource * feePercentOnDestination) / 100;
        const actualFeePercent = (1 - partAfterFeeOnDestination) * 100;

        expect(actualFeePercent).toBeCloseTo(expectedPercent, 5);
      });
    });
  });

  describe("Given tokens with transfer times", () => {
    const sourceChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      txTime: {
        [Messenger.ALLBRIDGE]: {
          in: 30000,
          out: 120000,
        },
      },
    };
    const destinationChainToken: TokenInfoWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      txTime: {
        [Messenger.ALLBRIDGE]: {
          in: 30000,
          out: 180000,
        },
      },
    };

    describe("getAverageTransferTime", () => {
      test("☀ Should return 210 sec -> 210000", () => {
        const actual = sdk.getAverageTransferTime(
          sourceChainToken,
          destinationChainToken,
          Messenger.ALLBRIDGE
        );
        expect(actual).toEqual(210_000);
      });

      describe("Given unsupported messenger", () => {
        const unsupportedMessenger = 999;

        test("☁ Should return null -> null", () => {
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
