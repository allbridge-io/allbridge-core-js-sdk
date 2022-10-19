/* eslint-disable @typescript-eslint/no-explicit-any */

import BN from "bn.js";
import nock, { Body, RequestBodyMatcher } from "nock";
import { TronWeb } from "tronweb-typings";
import { beforeEach, describe, expect, test, vi } from "vitest";

import Web3 from "web3";
import { EvmBridge } from "../bridge/evm";
import { TronBridge } from "../bridge/trx";
import * as UtilsModule from "../bridge/utils";
import {
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../client/core-api/core-api.model";
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  EvmProvider,
  Messenger,
  SendParamsWithChainSymbols,
  TokenInfoWithChainDetails,
  TronProvider,
} from "../index";

import { getFeePercent } from "../utils/calculation";
import tokenInfoList from "./data/tokens-info/TokenInfoWithChainDetails.json";
import tokenInfoResponse from "./mock/core-api/token-info.json";

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

  describe("send", () => {
    const fee = "20000000000000000";
    const receiveFeeResponse: ReceiveTransactionCostResponse = { fee };
    let scope: nock.Scope = nock("http://localhost")
      .get("/token-info")
      .reply(200, tokenInfoResponse)
      .persist();

    const nonceSpy = vi.spyOn(UtilsModule, "getNonce");
    // prettier-ignore
    // @ts-expect-error mock nonce
    const nonceBuffer = Buffer.from(["59", "18", "4e", "21", "62", "17", "8a", "2b", "b2", "27", "1a", "97", "50", "6d", "e9", "a9", "a3", "b8", "c7", "9e", "fa", "0c", "54", "38", "9d", "97", "30", "e0", "c7", "8e", "07", "12"]);
    nonceSpy.mockImplementation(() => nonceBuffer);

    test("Should return txId after sending GRL to TRX", async () => {
      const receiveFeeRequest: ReceiveTransactionCostRequest = {
        sourceChainId: 2,
        destinationChainId: 4,
        messenger: Messenger.ALLBRIDGE,
      };
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
        .reply(201, receiveFeeResponse)
        .persist();
      const fromAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
      const fromTokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
      const toTokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U"; // cspell:disable-line
      const toAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN"; // cspell:disable-line
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

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
      const bridgeMocked = {
        methods: {
          swapAndBridge: swapAndBridgeMocked,
        },
      };

      const getBridgeContract = vi.spyOn(
        EvmBridge.prototype as any,
        "getBridgeContract"
      );
      getBridgeContract.mockImplementation(() => {
        return bridgeMocked;
      });

      const transactionResponse = await sdk.send(
        new EvmProvider(new Web3()),
        sendParams
      );

      expect(swapAndBridgeMocked).toBeCalledTimes(1);
      expect(estimateGasMocked).toBeCalledTimes(1);
      expect(sendMocked).toBeCalledTimes(1);

      expect(swapAndBridgeMocked).lastCalledWith(
        "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        "1330000000000000000",
        "0x000000000000000000000000b83811067ab3a275ece28d3f8ec6875105ef9bae",
        4,
        "0x000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b",
        new BN(nonceBuffer),
        1
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
      const receiveFeeRequest: ReceiveTransactionCostRequest = {
        sourceChainId: 4,
        destinationChainId: 2,
        messenger: Messenger.ALLBRIDGE,
      };
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest))
        .reply(201, receiveFeeResponse)
        .persist();
      /* cSpell:disable */
      const fromAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN";
      const fromTokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U";
      const toTokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
      const toAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
      /* cSpell:enable */
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

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
      const bridgeMocked = {
        methods: {
          swapAndBridge: swapAndBridgeMocked,
        },
      };

      const getContract = vi.spyOn(TronBridge.prototype as any, "getContract");
      getContract.mockImplementation(() => {
        return bridgeMocked;
      });

      const verifyTxMocked = vi.spyOn(TronBridge.prototype as any, "verifyTx");
      verifyTxMocked.mockImplementation(() => {
        return;
      });

      const transactionResponse = await sdk.send(
        new TronProvider(new TronWeb("mock", "mock")),
        sendParams
      );

      expect(swapAndBridgeMocked).toBeCalledTimes(1);
      expect(verifyTxMocked).toBeCalledTimes(1);
      expect(sendMocked).toBeCalledTimes(1);

      expect(swapAndBridgeMocked).lastCalledWith(
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 177, 3, 136, 240, 79, 131, 49,
          181, 154, 2, 115, 44, 193, 182, 172, 13, 112, 69, 87, 75,
        ],
        "1330000000000000000",
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 104, 215, 237, 156, 249, 136, 20,
          39, 241, 219, 41, 155, 144, 253, 99, 239, 128, 93, 209, 13,
        ],
        2,
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 199, 219, 196, 168, 150, 179, 75,
          122, 16, 221, 162, 239, 114, 5, 33, 69, 169, 18, 47, 67,
        ],
        nonceBuffer.toJSON().data,
        1
      );
      expect(sendMocked).lastCalledWith({
        callValue: fee,
      });
      expect(transactionResponse).toEqual({ txId: transactionHash });
      scope.done();
    });
  });
});

function getRequestBodyMatcher(
  expectedBody: ReceiveTransactionCostRequest
): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}
