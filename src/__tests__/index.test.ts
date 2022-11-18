import { Big } from "big.js";
import BN from "bn.js";
import nock, { Body, RequestBodyMatcher } from "nock";
import { beforeEach, describe, expect, it, test, vi } from "vitest";

import Web3 from "web3";
import { formatAddress } from "../bridge/utils";
import {
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../client/core-api/core-api.model";
import {
  AllbridgeCoreSdk,
  ChainDetailsMap,
  ChainSymbol,
  ChainType,
  Messenger,
  SendParamsWithChainSymbols,
  TokenInfoWithChainDetails,
} from "../index";

import { getFeePercent } from "../utils/calculation";
import tokensGroupedByChain from "./data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGRL from "./data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoList from "./data/tokens-info/TokenInfoWithChainDetails.json";
import { mockEvmContract } from "./mock/bridge/evm/evm-bridge";
import {
  mockTronContract,
  mockTronVerifyTx,
} from "./mock/bridge/trx/trx-bridge";
import { mockNonce } from "./mock/bridge/utils";
import tokenInfoResponse from "./mock/core-api/token-info.json";
/* eslint-disable-next-line */
const TronWeb = require("tronweb");

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

  describe("Given info server", () => {
    const scope: nock.Scope = nock("http://localhost");

    scope.get("/token-info").reply(200, tokenInfoResponse).persist();

    describe("Get tokens info", () => {
      test("☀️ chainDetailsMap() returns ChainDetailsMap", async () => {
        const chainDetailsMap =
          tokensGroupedByChain as unknown as ChainDetailsMap;
        expect(await sdk.chainDetailsMap()).toEqual(chainDetailsMap);
      });

      it("☀️ tokens() returns a list of TokenInfoWithChainDetails", async () => {
        const expectedTokenInfoWithChainDetails =
          tokenInfoList as unknown as TokenInfoWithChainDetails[];
        expect(await sdk.tokens()).toEqual(expectedTokenInfoWithChainDetails);
      });

      it("☀️ tokensByChain(GRL) returns a list of TokenInfoWithChainDetails on Goerli chain", async () => {
        const expectedTokenInfoWithChainDetailsGRL =
          tokenInfoWithChainDetailsGRL as unknown as TokenInfoWithChainDetails[];
        expect(await sdk.tokensByChain(ChainSymbol.GRL)).toEqual(
          expectedTokenInfoWithChainDetailsGRL
        );
      });
    });

    describe("send", () => {
      const fee = "20000000000000000";
      const receiveFeeResponse: ReceiveTransactionCostResponse = { fee };
      const nonceBuffer = mockNonce();
      const tokensAmount = "1.33";

      test("Should return txId after sending GRL to TRX", async () => {
        const toChainId = 4;
        const receiveFeeRequest: ReceiveTransactionCostRequest = {
          sourceChainId: 2,
          destinationChainId: toChainId,
          messenger: Messenger.ALLBRIDGE,
        };
        scope
          .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
          .reply(201, receiveFeeResponse)
          .persist();
        const fromAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        const fromTokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
        const toTokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U"; // cspell:disable-line
        const toAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN"; // cspell:disable-line
        const fromTokenDecimals = 18;

        const sendParams: SendParamsWithChainSymbols = {
          amount: tokensAmount,

          fromChainSymbol: ChainSymbol.GRL,
          fromTokenAddress: fromTokenAddress,
          fromAccountAddress: fromAccountAddress,

          toChainSymbol: ChainSymbol.TRX,
          toTokenAddress: toTokenAddress,
          toAccountAddress: toAccountAddress,

          messenger: Messenger.ALLBRIDGE,
        };

        const gas = 100000;
        const estimateGasMocked = vi.fn(() => {
          return gas;
        });
        const transactionHash = 1234567890;
        const sendMocked = vi.fn(() => {
          return { transactionHash: transactionHash };
        });
        const swapAndBridgeMocked = vi.fn(() => {
          return {
            estimateGas: estimateGasMocked,
            send: sendMocked,
          };
        });
        mockEvmContract({
          swapAndBridge: swapAndBridgeMocked,
        });

        const transactionResponse = await sdk.send(new Web3(), sendParams);

        expect(swapAndBridgeMocked).toBeCalledTimes(1);
        expect(estimateGasMocked).toBeCalledTimes(1);
        expect(sendMocked).toBeCalledTimes(1);

        const expectedAmount = Big(tokensAmount)
          .mul(10 ** fromTokenDecimals)
          .toFixed();
        expect(swapAndBridgeMocked).lastCalledWith(
          formatAddress(fromTokenAddress, ChainType.EVM, ChainType.EVM),
          expectedAmount,
          formatAddress(toAccountAddress, ChainType.TRX, ChainType.EVM),
          toChainId,
          formatAddress(toTokenAddress, ChainType.TRX, ChainType.EVM),
          new BN(nonceBuffer),
          Messenger.ALLBRIDGE
        );
        expect(estimateGasMocked).lastCalledWith({
          from: fromAccountAddress,
          value: fee,
        });
        expect(sendMocked).lastCalledWith({
          from: fromAccountAddress,
          gas: gas,
          value: fee,
        });
        expect(transactionResponse).toEqual({ txId: transactionHash });
        scope.done();
      });

      test("Should return txId after sending TRX to GRL", async () => {
        const toChainId = 2;

        const receiveFeeRequest: ReceiveTransactionCostRequest = {
          sourceChainId: 4,
          destinationChainId: toChainId,
          messenger: Messenger.ALLBRIDGE,
        };
        scope
          .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
          .reply(201, receiveFeeResponse)
          .persist();
        /* cSpell:disable */
        const fromAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN";
        const fromTokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U";
        const toTokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
        const toAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        /* cSpell:enable */
        const toTokenDecimals = 18;
        const sendParams: SendParamsWithChainSymbols = {
          amount: tokensAmount,

          fromChainSymbol: ChainSymbol.TRX,
          fromTokenAddress: fromTokenAddress,
          fromAccountAddress: fromAccountAddress,

          toChainSymbol: ChainSymbol.GRL,
          toTokenAddress: toTokenAddress,
          toAccountAddress: toAccountAddress,

          messenger: Messenger.ALLBRIDGE,
        };

        const gas = 100000;
        const estimateGasMocked = vi.fn(() => {
          return gas;
        });
        const transactionHash = 1234567890;
        const sendMocked = vi.fn(() => {
          return transactionHash;
        });
        const swapAndBridgeMocked = vi.fn(() => {
          return {
            estimateGas: estimateGasMocked,
            send: sendMocked,
          };
        });
        mockTronContract({
          swapAndBridge: swapAndBridgeMocked,
        });
        const verifyTxMocked = mockTronVerifyTx();
        // prettier-ignore
        /* eslint-disable-next-line */
        const transactionResponse = await sdk.send(new TronWeb("mock", "mock"), sendParams);
        expect(swapAndBridgeMocked).toBeCalledTimes(1);
        expect(verifyTxMocked).toBeCalledTimes(1);
        expect(sendMocked).toBeCalledTimes(1);

        const expectedAmount = Big(tokensAmount)
          .mul(10 ** toTokenDecimals)
          .toFixed();
        expect(swapAndBridgeMocked).lastCalledWith(
          formatAddress(fromTokenAddress, ChainType.TRX, ChainType.TRX),
          expectedAmount,
          formatAddress(toAccountAddress, ChainType.EVM, ChainType.TRX),
          toChainId,
          formatAddress(toTokenAddress, ChainType.EVM, ChainType.TRX),
          nonceBuffer.toJSON().data,
          Messenger.ALLBRIDGE
        );
        expect(sendMocked).lastCalledWith({
          callValue: fee,
        });
        expect(transactionResponse).toEqual({ txId: transactionHash });
        scope.done();
      });
    });

    describe("Allowance", () => {
      const tokensAmount = "100.1";
      const owner = "owner";

      describe("Given EVM bridge", () => {
        const chainSymbol = ChainSymbol.GRL;
        /* cSpell:disable */
        const tokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
        const poolAddress = "0x727e10f9E750C922bf9dee7620B58033F566b34F";
        /* cSpell:enable */
        const tokenDecimals = 18;
        const provider = new Web3();

        let methodCallMock: any;
        let allowanceMocked: any;

        beforeEach(() => {
          methodCallMock = vi.fn(() => {
            return Big(tokensAmount)
              .mul(10 ** tokenDecimals)
              .toFixed();
          });
          allowanceMocked = vi.fn(() => {
            return {
              call: methodCallMock,
            };
          });
          mockEvmContract({
            allowance: allowanceMocked,
          });
        });

        test("☀️ getAllowance should return float. amount of approved tokens", async () => {
          const actual = await sdk.getAllowance(provider, {
            owner: owner,
            chainSymbol: chainSymbol,
            tokenAddress: tokenAddress,
          });
          expect(allowanceMocked).toBeCalledWith(owner, poolAddress);
          expect(allowanceMocked).toHaveBeenCalledOnce();
          expect(methodCallMock).toHaveBeenCalledOnce();
          expect(actual).toEqual(tokensAmount);

          scope.done();
        });

        test.each([
          {
            amount: tokensAmount,
            expected: true,
          },
          {
            amount: "99.9",
            expected: true,
          },
          {
            amount: "1000",
            expected: false,
          },
        ])(
          `☀️ checkAllowance should return true when amount is less than or equal to amount of approved tokens`,
          async ({ amount, expected }) => {
            const actual = await sdk.checkAllowance(provider, {
              owner: owner,
              chainSymbol: chainSymbol,
              tokenAddress: tokenAddress,
              amount: amount,
            });
            expect(allowanceMocked).toBeCalledWith(owner, poolAddress);
            expect(allowanceMocked).toHaveBeenCalledOnce();
            expect(methodCallMock).toHaveBeenCalledOnce();
            expect(actual).toEqual(expected);
            scope.done();
          }
        );
      });

      describe("Given Tron bridge", () => {
        const chainSymbol = ChainSymbol.TRX;
        /* cSpell:disable */
        const tokenAddress = "TYjmrhFaFMNKE8RheRUCQUWJHpRbY8Q9zy";
        const poolAddress = "TYZmD6XgFNRNkDthZ8y7o2D9wPTqex7eRD";
        /* cSpell:enable */
        const tokenDecimals = 18;

        const provider = new TronWeb("mock", "mock");

        let methodCallMock: any;
        let allowanceMocked: any;

        beforeEach(() => {
          methodCallMock = vi.fn(() => {
            return Big(tokensAmount)
              .mul(10 ** tokenDecimals)
              .toFixed();
          });
          allowanceMocked = vi.fn(() => {
            return {
              call: methodCallMock,
            };
          });
          mockTronContract({
            allowance: allowanceMocked,
          });
        });

        test("☀️ getAllowance should return float. amount of approved tokens", async () => {
          const actual = await sdk.getAllowance(provider, {
            owner: owner,
            chainSymbol: chainSymbol,
            tokenAddress: tokenAddress,
          });
          expect(allowanceMocked).toBeCalledWith(owner, poolAddress);
          expect(allowanceMocked).toHaveBeenCalledOnce();
          expect(methodCallMock).toHaveBeenCalledOnce();
          expect(actual).toEqual(tokensAmount);

          scope.done();
        });

        test.each([
          {
            amount: tokensAmount,
            expected: true,
          },
          {
            amount: "99.9",
            expected: true,
          },
          {
            amount: "1000",
            expected: false,
          },
        ])(
          `☀️ checkAllowance should return true when amount is less than or equal to amount of approved tokens`,
          async ({ amount, expected }) => {
            const actual = await sdk.checkAllowance(provider, {
              owner: owner,
              chainSymbol: chainSymbol,
              tokenAddress: tokenAddress,
              amount: amount,
            });
            expect(allowanceMocked).toBeCalledWith(owner, poolAddress);
            expect(allowanceMocked).toHaveBeenCalledOnce();
            expect(methodCallMock).toHaveBeenCalledOnce();
            expect(actual).toEqual(expected);
            scope.done();
          }
        );
      });
    });
  });
});

function getRequestBodyMatcher(
  expectedBody: ReceiveTransactionCostRequest
): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}
