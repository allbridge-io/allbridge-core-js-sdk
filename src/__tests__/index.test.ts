import { Big } from "big.js";
import nock, { cleanAll as nockCleanAll } from "nock";
// @ts-expect-error import tron
import TronWeb from "tronweb";

import Web3 from "web3";
import { ChainDecimalsByType } from "../chains";
import { ReceiveTransactionCostRequest, ReceiveTransactionCostResponse } from "../client/core-api/core-api.model";
import {
  AllbridgeCoreSdk,
  AllbridgeCoreSdkOptions,
  AmountFormat,
  ChainDetailsMap,
  ChainSymbol,
  ChainType,
  CheckAllowanceParams,
  FeePaymentMethod,
  GasFeeOptions,
  GetAllowanceParams,
  GetTokenBalanceParams,
  Messenger,
  NodeUrlsConfig,
  PoolInfo,
  SendParams,
  SwapParams,
  TokenWithChainDetails,
} from "../index";
import { formatAddress } from "../services/bridge/utils";

import { convertFloatAmountToInt, convertIntAmountToFloat, getFeePercent } from "../utils/calculation";
import tokensGroupedByChain from "./data/tokens-info/ChainDetailsMap.json";
import tokenInfoWithChainDetailsGrl from "./data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetailsTrx from "./data/tokens-info/TokenInfoWithChainDetails-TRX.json";
import tokenInfoList from "./data/tokens-info/TokenInfoWithChainDetails.json";
import { mockEvmBridgeContract, mockEvmSendRawTransaction } from "./mock/bridge/evm/evm-bridge";
import { mockNonce } from "./mock/bridge/utils";
import tokenInfoResponse from "./mock/core-api/token-info.json";
import { mockedTokenBalance, mockTokenService_getTokenBalance } from "./mock/token";
import { mockEvmTokenContract } from "./mock/token/evm/evm-token";
import { mockTronTokenContract } from "./mock/token/trx/trx-token";
import { getRequestBodyMatcher, mockTokenInfoEndpoint } from "./mock/utils";

const basicTokenInfoWithChainDetails = tokenInfoList[1] as unknown as TokenWithChainDetails;
const basicTokenInfoWithChainDetails2 = tokenInfoList[2] as unknown as TokenWithChainDetails;
const trxBasicTokenInfoWithChainDetails = tokenInfoList[5] as unknown as TokenWithChainDetails;

jest.mock("../services/bridge/sol/jupiter");

describe("SDK", () => {
  let sdk: AllbridgeCoreSdk;

  const testNodeUrls: NodeUrlsConfig = {
    solanaRpcUrl: "solanaRpcUrl",
    tronRpcUrl: "tronRpcUrl",
  };
  const testConfig: AllbridgeCoreSdkOptions = {
    coreApiUrl: "http://localhost",
    wormholeMessengerProgramId: "wormholeMessengerProgramId",
    solanaLookUpTable: "solanaLookUpTable",
    sorobanNetworkPassphrase: "sorobanNetworkPassphrase",
  };
  beforeEach(() => {
    sdk = new AllbridgeCoreSdk(testNodeUrls, testConfig);
  });

  describe("Given tokens with different precision", () => {
    const scope: nock.Scope = nock("http://localhost");

    const sourceChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.GRL,
      decimals: 18,
      feeShare: "0",
    };
    const destinationChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.TRX,
      decimals: 6,
      feeShare: "0",
    };

    const poolInfo: PoolInfo = {
      aValue: "20",
      dValue: "200001",
      tokenBalance: "100000",
      vUsdBalance: "100000",
      totalLpAmount: "",
      accRewardPerShareP: "",
      p: 0,
      imbalance: "0",
    };
    const amountToSend = "100";
    const amountToReceive = "84.18";

    beforeAll(() => {
      mockTokenInfoEndpoint(scope, [
        { token: sourceChainToken, poolInfo: poolInfo },
        { token: destinationChainToken, poolInfo: poolInfo },
      ]);
    });
    afterAll(() => {
      nockCleanAll();
    });

    test(`☀ getAmountToBeReceived for ${amountToSend} should return -> ${amountToReceive}`, async () => {
      const actual = await sdk.getAmountToBeReceived(amountToSend, sourceChainToken, destinationChainToken);
      expect(actual).toEqual(amountToReceive);
      scope.done();
    });

    test(`☀ getAmountToSend for ${amountToReceive} should return -> ${amountToSend}`, async () => {
      const actual = await sdk.getAmountToSend(amountToReceive, sourceChainToken, destinationChainToken);
      expect(+actual).toBeCloseTo(+amountToSend, 2);
      scope.done();
    });
  });

  describe("Given tokens with imbalanced poolInfo", () => {
    const scope: nock.Scope = nock("http://localhost");
    const sourceChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.GRL,
      decimals: 6,
      feeShare: "0",
    };
    const sourcePoolInfo: PoolInfo = {
      aValue: "20",
      dValue: "204253",
      tokenBalance: "17684",
      vUsdBalance: "191863",
      totalLpAmount: "",
      accRewardPerShareP: "",
      p: 0,
      imbalance: "0",
    };
    const destinationChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.TRX,
      decimals: 18,
      feeShare: "0",
    };
    const destinationPoolInfo: PoolInfo = {
      aValue: "20",
      dValue: "206649",
      tokenBalance: "202486",
      vUsdBalance: "12487",
      totalLpAmount: "",
      accRewardPerShareP: "",
      p: 0,
      imbalance: "0",
    };
    beforeAll(() => {
      mockTokenInfoEndpoint(scope, [
        { token: sourceChainToken, poolInfo: sourcePoolInfo },
        { token: destinationChainToken, poolInfo: destinationPoolInfo },
      ]);
    });
    afterAll(() => {
      nockCleanAll();
    });

    const amountToSend = "84.16";
    const amountToReceive = "97.776";

    test(`☀ getAmountToBeReceived for ${amountToSend} should return -> ${amountToReceive}`, async () => {
      const actual = await sdk.getAmountToBeReceived(amountToSend, sourceChainToken, destinationChainToken);
      expect(actual).toEqual(amountToReceive);
      scope.done();
    });

    test(`☀ getAmountToSend for ${amountToReceive} should return -> ${amountToSend}`, async () => {
      const actual = await sdk.getAmountToSend(amountToReceive, sourceChainToken, destinationChainToken);
      expect(+actual).toBeCloseTo(+amountToSend, 2);
      scope.done();
    });
  });

  describe("Given tokens with fee", () => {
    const scope: nock.Scope = nock("http://localhost");
    const sourceChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.GRL,
      decimals: 18,
      feeShare: "0.003",
    };
    const sourcePoolInfo: PoolInfo = {
      aValue: "20",
      dValue: "200000001",
      tokenBalance: "100166280",
      vUsdBalance: "99833728",
      totalLpAmount: "",
      accRewardPerShareP: "",
      p: 0,
      imbalance: "0",
    };
    const destinationChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      chainSymbol: ChainSymbol.TRX,
      decimals: 18,
      feeShare: "0.003",
    };
    const destinationPoolInfo: PoolInfo = {
      aValue: "20",
      dValue: "200000001",
      tokenBalance: "99738849",
      vUsdBalance: "100261169",
      totalLpAmount: "",
      accRewardPerShareP: "",
      p: 0,
      imbalance: "0",
    };
    beforeAll(() => {
      mockTokenInfoEndpoint(scope, [
        { token: sourceChainToken, poolInfo: sourcePoolInfo },
        { token: destinationChainToken, poolInfo: destinationPoolInfo },
      ]);
    });
    afterAll(() => {
      nockCleanAll();
    });

    const amountToSend = "10";
    const vUsd = 9.969;
    const amountToReceive = "9.938096";

    test(`☀ getAmountToBeReceived for amount ${amountToSend} should return -> ${amountToReceive}`, async () => {
      const actual = await sdk.getAmountToBeReceived(amountToSend, sourceChainToken, destinationChainToken);
      expect(actual).toEqual(amountToReceive);
      scope.done();
    });

    test(`☀ getAmountToSend for amount ${amountToReceive} should return -> ${amountToSend}`, async () => {
      const actual = await sdk.getAmountToSend(amountToReceive, sourceChainToken, destinationChainToken);
      expect(actual).toEqual(amountToSend);
      scope.done();
    });

    describe("calculateFeesPercentOnSourceChain", () => {
      const expectedPercent = getFeePercent(amountToSend, vUsd);
      test(`☀️ should return fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, async () => {
        const actual = await sdk.calculateFeePercentOnSourceChain(amountToSend, sourceChainToken);
        expect(actual).toEqual(expectedPercent);
      });

      test("☁ calculateFeePercentOnSourceChain should return for amount: 0.1 -> 1%", async () => {
        const actual = await sdk.calculateFeePercentOnSourceChain(0.1, sourceChainToken);
        expect(actual).toEqual(1);
      });
    });

    describe("calculateFeePercentOnDestinationChain", () => {
      const expectedPercent = getFeePercent(vUsd, amountToReceive);
      test(`☀️ should return fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, async () => {
        const actual = await sdk.calculateFeePercentOnDestinationChain(
          amountToSend,
          sourceChainToken,
          destinationChainToken
        );
        expect(actual).toBeCloseTo(expectedPercent, 2);
      });

      test("☁ should return for amount: 0.1 -> 0.3%", async () => {
        const actual = await sdk.calculateFeePercentOnDestinationChain(0.1, sourceChainToken, destinationChainToken);
        expect(actual).toEqual(0.3);
      });
    });

    describe("calculate total fee", () => {
      const expectedPercent = getFeePercent(amountToSend, amountToReceive);

      test(`☀️ calculated source and destination fees should match total fee percent for amount: ${amountToSend} -> ${expectedPercent}%`, async () => {
        const feePercentOnSource = await sdk.calculateFeePercentOnSourceChain(amountToSend, sourceChainToken);
        const feePercentOnDestination = await sdk.calculateFeePercentOnDestinationChain(
          amountToSend,
          sourceChainToken,
          destinationChainToken
        );
        const partAfterFeeOnSource = 1 - feePercentOnSource / 100;
        const partAfterFeeOnDestination = partAfterFeeOnSource - (partAfterFeeOnSource * feePercentOnDestination) / 100;
        const actualFeePercent = (1 - partAfterFeeOnDestination) * 100;

        expect(actualFeePercent).toBeCloseTo(expectedPercent, 5);
      });
    });
  });

  describe("Given tokens with transfer times", () => {
    const transferTime = 211_111;
    const sourceChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      transferTime: {
        [ChainSymbol.POL]: {
          [Messenger.ALLBRIDGE]: transferTime,
          [Messenger.WORMHOLE]: 120000,
        },
      },
    };
    const destinationChainToken: TokenWithChainDetails = basicTokenInfoWithChainDetails2;

    describe("getAverageTransferTime", () => {
      test("☀ Should return transferTime 211_111 ms", () => {
        const actual = sdk.getAverageTransferTime(sourceChainToken, destinationChainToken, Messenger.ALLBRIDGE);
        expect(actual).toEqual(transferTime);
      });

      describe("Given unsupported messenger", () => {
        const unsupportedMessenger = 999;

        test("☁ Should return null -> null", () => {
          const actual = sdk.getAverageTransferTime(sourceChainToken, destinationChainToken, unsupportedMessenger);
          expect(actual).toBeNull();
        });
      });
    });
  });

  describe("Given token info endpoint", () => {
    const scope: nock.Scope = nock("http://localhost");

    afterAll(() => {
      nockCleanAll();
    });

    describe("Get tokens info", () => {
      beforeAll(() => {
        scope.get("/token-info").reply(200, tokenInfoResponse).persist();
      });

      test("☀️ chainDetailsMap() returns ChainDetailsMap", async () => {
        const chainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;
        expect(await sdk.chainDetailsMap()).toEqual(chainDetailsMap);
      });

      test("☀️ tokens() returns a list of TokenWithChainDetails", async () => {
        const expectedTokenInfoWithChainDetails = tokenInfoList as unknown as TokenWithChainDetails[];
        expect(await sdk.tokens()).toEqual(expectedTokenInfoWithChainDetails);
      });

      test("☀️ tokensByChain(GRL) returns a list of TokenWithChainDetails on Goerli chain", async () => {
        const expectedTokenInfoWithChainDetailsGrl = tokenInfoWithChainDetailsGrl as unknown as TokenWithChainDetails[];
        expect(await sdk.tokensByChain(ChainSymbol.GRL)).toEqual(expectedTokenInfoWithChainDetailsGrl);
      });
    });

    describe("Allowance", () => {
      const tokensAmount = "100.1";
      const owner = "owner";

      describe("Given EVM bridge", () => {
        /* cSpell:disable */
        const tokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
        const poolAddress = "0x727e10f9E750C922bf9dee7620B58033F566b34F";
        const bridgeAddress = "0xba285A8F52601EabCc769706FcBDe2645aa0AF18";
        const grlTokenInfo = tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails;
        /* cSpell:enable */
        const tokenDecimals = 18;
        const provider = new Web3();

        let methodCallMock: any;
        let allowanceMocked: any;

        beforeEach(() => {
          methodCallMock = jest.fn(() => {
            return Big(tokensAmount)
              .mul(10 ** tokenDecimals)
              .toFixed();
          });
          allowanceMocked = jest.fn(() => {
            return {
              call: methodCallMock,
            };
          });
          mockEvmTokenContract({
            allowance: allowanceMocked,
          });
        });

        test("☀️ getAllowance should return float. amount of approved tokens", async () => {
          const tokenInfo = tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails;
          const actual = await sdk.bridge.getAllowance(provider, {
            token: tokenInfo,
            owner: owner,
          });
          expect(allowanceMocked).toBeCalledWith(owner, tokenInfo.bridgeAddress);
          expect(allowanceMocked).toHaveBeenCalledTimes(1);
          expect(methodCallMock).toHaveBeenCalledTimes(1);
          expect(actual).toEqual(tokensAmount);

          scope.done();
        });

        test("☀️ getAllowance should return float. amount of approved tokens for PoolInfo contract when called with GetAllowanceParams", async () => {
          const params: GetAllowanceParams = {
            token: {
              ...basicTokenInfoWithChainDetails,
              decimals: tokenDecimals,
              tokenAddress,
              poolAddress,
            },
            owner: owner,
            gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
          };

          const actual = await sdk.bridge.getAllowance(provider, params);
          expect(allowanceMocked).toBeCalledWith(owner, bridgeAddress);
          expect(allowanceMocked).toHaveBeenCalledTimes(1);
          expect(methodCallMock).toHaveBeenCalledTimes(1);
          expect(actual).toEqual(tokensAmount);

          scope.done();
        });

        test("☀️ getAllowance should return float. amount of approved tokens for Payer contract when called with GetAllowanceParams", async () => {
          const params: GetAllowanceParams = {
            token: {
              ...basicTokenInfoWithChainDetails,
              decimals: tokenDecimals,
              tokenAddress,
              poolAddress,
            },
            owner: owner,
            gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
          };

          const actual = await sdk.bridge.getAllowance(provider, params);
          expect(allowanceMocked).toBeCalledWith(owner, params.token.bridgeAddress);
          expect(allowanceMocked).toHaveBeenCalledTimes(1);
          expect(methodCallMock).toHaveBeenCalledTimes(1);
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
          `☀️ checkAllowance should return true only when amount is less than or equal to amount of approved tokens (amount: $amount)`,
          async ({ amount, expected }) => {
            const actual = await sdk.bridge.checkAllowance(provider, {
              token: grlTokenInfo,
              owner: owner,
              amount: amount,
            });
            expect(allowanceMocked).toBeCalledWith(owner, grlTokenInfo.bridgeAddress);
            expect(allowanceMocked).toHaveBeenCalledTimes(1);
            expect(methodCallMock).toHaveBeenCalledTimes(1);
            expect(actual).toEqual(expected);
            scope.done();
          }
        );

        test.each([
          {
            amount: tokensAmount,
            expected: true,
            gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
          {
            amount: "99.9",
            expected: true,
            gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
          {
            amount: "1000",
            expected: false,
            gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
          {
            amount: tokensAmount,
            expected: true,
            gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
          {
            amount: "99.9",
            expected: true,
            gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
          {
            amount: "1000",
            expected: false,
            gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
            expectedContractAddress: grlTokenInfo.bridgeAddress,
          },
        ])(
          `☀️ checkAllowance should return true only when amount is less than or equal to amount of approved tokens (CheckAllowanceParamsWithTokenInfo) (amount: $amount, pay with: $gasFeePaymentMethod) }`,
          async ({ amount, expected, gasFeePaymentMethod, expectedContractAddress }) => {
            const params: CheckAllowanceParams = {
              token: {
                ...basicTokenInfoWithChainDetails,
                decimals: tokenDecimals,
                tokenAddress,
                poolAddress,
              },
              owner,
              gasFeePaymentMethod,
              amount,
            };

            const actual = await sdk.bridge.checkAllowance(provider, params);
            expect(allowanceMocked).toBeCalledWith(owner, expectedContractAddress);
            expect(allowanceMocked).toHaveBeenCalledTimes(1);
            expect(methodCallMock).toHaveBeenCalledTimes(1);
            expect(actual).toEqual(expected);
            scope.done();
          }
        );
      });

      describe("Given Tron bridge", () => {
        const trxTokenInfo = tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails;
        const tokenDecimals = 18;

        const provider = new TronWeb("mock", "mock");

        let methodCallMock: any;
        let allowanceMocked: any;

        beforeEach(() => {
          methodCallMock = jest.fn(() => {
            return Big(tokensAmount)
              .mul(10 ** tokenDecimals)
              .toFixed();
          });
          allowanceMocked = jest.fn(() => {
            return {
              call: methodCallMock,
            };
          });
          mockTronTokenContract({
            allowance: allowanceMocked,
          });
        });

        test("☀️ getAllowance should return float. amount of approved tokens", async () => {
          const actual = await sdk.bridge.getAllowance(provider, {
            owner: owner,
            token: trxTokenInfo,
          });
          expect(allowanceMocked).toBeCalledWith(owner, trxTokenInfo.bridgeAddress);
          expect(allowanceMocked).toHaveBeenCalledTimes(1);
          expect(methodCallMock).toHaveBeenCalledTimes(1);
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
            const actual = await sdk.bridge.checkAllowance(provider, {
              token: trxTokenInfo,
              owner: owner,
              amount: amount,
            });
            expect(allowanceMocked).toBeCalledWith(owner, trxTokenInfo.bridgeAddress);
            expect(allowanceMocked).toHaveBeenCalledTimes(1);
            expect(methodCallMock).toHaveBeenCalledTimes(1);
            expect(actual).toEqual(expected);
            scope.done();
          }
        );
      });
    });
  });

  describe("send", () => {
    const scope: nock.Scope = nock("http://localhost");

    const grlChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      allbridgeChainId: 2,
      chainSymbol: ChainSymbol.GRL,
      bridgeAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
      tokenAddress: "0xDdaC3cb57DEa3fBEFF4997d78215535Eb5787117",
      decimals: 18,
      feeShare: "0.003",
    };
    const grlChainToken2: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      allbridgeChainId: 2,
      chainSymbol: ChainSymbol.GRL,
      bridgeAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
      tokenAddress: "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43",
      decimals: 18,
      feeShare: "0.003",
    };
    const trxChainToken: TokenWithChainDetails = {
      ...trxBasicTokenInfoWithChainDetails,
      allbridgeChainId: 4,
      chainSymbol: ChainSymbol.TRX,
      /* cSpell:disable */
      bridgeAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
      tokenAddress: "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U",
      /* cSpell:enable */
      decimals: 18,
      feeShare: "0.003",
    };
    const trxChainToken2: TokenWithChainDetails = {
      ...trxBasicTokenInfoWithChainDetails,
      allbridgeChainId: 4,
      chainSymbol: ChainSymbol.TRX,
      /* cSpell:disable */
      bridgeAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
      tokenAddress: "TEwnUeq4d2oZRtg9x7ZdZgqJhMpYzpAtLp",
      /* cSpell:enable */
      decimals: 18,
      feeShare: "0.003",
    };

    const fee = "20000000000000000";
    const sourceNativeTokenPrice = "1501.0000";
    const exchangeRate = "0.12550590438537169016";
    const feeInStablecoins = "30.02";
    const nonceBuffer = mockNonce();
    const tokensAmount = "1.33";

    describe("when paying gas fee with native tokens", () => {
      afterAll(() => {
        nockCleanAll();
        jest.clearAllMocks();
      });

      const receiveFeeResponse: ReceiveTransactionCostResponse = {
        fee,
        sourceNativeTokenPrice,
        exchangeRate,
      };

      test("Should return txId after sending GRL to TRX", async () => {
        const receiveFeeRequest: ReceiveTransactionCostRequest = {
          sourceChainId: grlChainToken.allbridgeChainId,
          destinationChainId: trxChainToken.allbridgeChainId,
          messenger: Messenger.ALLBRIDGE,
        };
        scope.post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest)).reply(201, receiveFeeResponse).persist();
        const fromAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        const toAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN"; // cSpell:disable-line

        const sendParams: SendParams = {
          amount: tokensAmount,
          fromAccountAddress: fromAccountAddress,
          toAccountAddress: toAccountAddress,
          sourceToken: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
          destinationToken: tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails,
          messenger: Messenger.ALLBRIDGE,
        };

        const gas = 100000;
        const estimateGasMocked = jest.fn(() => {
          return gas;
        });
        const transactionHash = "1234567890";
        const expectedData = "data";
        const encodeABIMocked = jest.fn(() => {
          return expectedData;
        });
        const swapAndBridgeMocked = jest.fn(() => {
          return {
            estimateGas: estimateGasMocked,
            encodeABI: encodeABIMocked,
          };
        });
        mockEvmBridgeContract({
          swapAndBridge: swapAndBridgeMocked,
        });
        const methodSendRawTransactionSpy = mockEvmSendRawTransaction(transactionHash);

        const transactionResponse = await sdk.bridge.send(new Web3(), sendParams);

        expect(swapAndBridgeMocked).toBeCalledTimes(1);
        expect(methodSendRawTransactionSpy).toHaveBeenCalledTimes(1);
        expect(methodSendRawTransactionSpy).toHaveBeenCalledWith({
          from: fromAccountAddress,
          to: grlChainToken.bridgeAddress,
          value: fee,
          data: expectedData,
        });

        const expectedAmount = Big(tokensAmount)
          .mul(10 ** grlChainToken.decimals)
          .toFixed();
        expect(swapAndBridgeMocked).lastCalledWith(
          formatAddress(grlChainToken.tokenAddress, ChainType.EVM, ChainType.EVM),
          expectedAmount,
          formatAddress(toAccountAddress, ChainType.TRX, ChainType.EVM),
          trxChainToken.allbridgeChainId,
          formatAddress(trxChainToken.tokenAddress, ChainType.TRX, ChainType.EVM),
          "0x" + nonceBuffer.toString("hex"),
          Messenger.ALLBRIDGE,
          0
        );
        expect(transactionResponse).toEqual({ txId: transactionHash });
        scope.done();
      });

      test("Should return txId after sending TRX to GRL", async () => {
        const receiveFeeRequest: ReceiveTransactionCostRequest = {
          sourceChainId: trxChainToken.allbridgeChainId,
          destinationChainId: grlChainToken.allbridgeChainId,
          messenger: Messenger.ALLBRIDGE,
        };
        scope.post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest)).reply(201, receiveFeeResponse).persist();
        /* cSpell:disable */
        const fromAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN";
        const toAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        /* cSpell:enable */
        const sendParams: SendParams = {
          amount: tokensAmount,
          fromAccountAddress: fromAccountAddress,
          toAccountAddress: toAccountAddress,
          sourceToken: tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails,
          destinationToken: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
          messenger: Messenger.ALLBRIDGE,
        };

        const transactionHash = "1234567890";
        const rawTx = "rawTx";
        const methodTriggerSmartContractMock = jest.fn(() => {
          return {
            result: {
              result: true,
            },
            transaction: rawTx,
          };
        });
        const signedTx = { signature: "signature" };
        const methodSignMock = jest.fn(() => {
          return signedTx;
        });
        const methodSendRawTransactionMock = jest.fn(() => {
          return { txid: transactionHash, transaction: { txID: transactionHash } };
        });
        const methodVerifyTxMocked = jest.fn(() => {
          return { receipt: { result: "SUCCESS" } };
        });
        const tronWebMock: TronWeb = {
          transactionBuilder: {
            triggerSmartContract: methodTriggerSmartContractMock,
          },
          trx: {
            sign: methodSignMock,
            sendRawTransaction: methodSendRawTransactionMock,
            getUnconfirmedTransactionInfo: methodVerifyTxMocked,
          },
        };

        const transactionResponse = await sdk.bridge.send(tronWebMock, sendParams);
        expect(methodTriggerSmartContractMock).toHaveBeenCalledTimes(1);
        const expectedAmount = Big(tokensAmount)
          .mul(10 ** trxChainToken.decimals)
          .toFixed();
        expect(methodTriggerSmartContractMock).toBeCalledWith(
          trxChainToken.bridgeAddress,
          "swapAndBridge(bytes32,uint256,bytes32,uint256,bytes32,uint256,uint8,uint256)",
          { callValue: fee },
          [
            {
              type: "bytes32",
              value: formatAddress(trxChainToken.tokenAddress, ChainType.TRX, ChainType.TRX),
            },
            { type: "uint256", value: expectedAmount },
            {
              type: "bytes32",
              value: formatAddress(toAccountAddress, ChainType.EVM, ChainType.TRX),
            },
            { type: "uint256", value: grlChainToken.allbridgeChainId },
            {
              type: "bytes32",
              value: formatAddress(grlChainToken.tokenAddress, ChainType.EVM, ChainType.TRX),
            },
            { type: "uint256", value: nonceBuffer.toJSON().data },
            { type: "uint8", value: Messenger.ALLBRIDGE },
            { type: "uint256", value: 0 },
          ],
          fromAccountAddress
        );
        expect(methodSignMock).toHaveBeenCalledTimes(1);
        expect(methodSignMock).toBeCalledWith(rawTx);
        expect(methodSendRawTransactionMock).toHaveBeenCalledTimes(1);
        expect(methodSendRawTransactionMock).toBeCalledWith(signedTx);
        expect(methodVerifyTxMocked).toHaveBeenCalledTimes(1);
        expect(methodVerifyTxMocked).toBeCalledWith(transactionHash);

        expect(transactionResponse).toEqual({ txId: transactionHash });
        scope.done();
      });
    });

    describe("when paying gas fee with stablecoins", () => {
      afterEach(() => {
        nockCleanAll();
        jest.clearAllMocks();
        jest.restoreAllMocks();
      });

      const receiveFeeResponse: ReceiveTransactionCostResponse = {
        fee,
        sourceNativeTokenPrice,
        exchangeRate,
      };

      test("Should return txId after sending GRL to TRX", async () => {
        const receiveFeeRequest: ReceiveTransactionCostRequest = {
          sourceChainId: grlChainToken.allbridgeChainId,
          destinationChainId: trxChainToken.allbridgeChainId,
          messenger: Messenger.ALLBRIDGE,
        };
        scope.post("/receive-fee", getRequestBodyMatcher(receiveFeeRequest)).reply(201, receiveFeeResponse).persist();
        const fromAccountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        const toAccountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN"; // cSpell:disable-line

        const totalAmountFloat = Big(tokensAmount).add(feeInStablecoins).toFixed();

        const sendParams: SendParams = {
          amount: totalAmountFloat,
          fromAccountAddress: fromAccountAddress,
          toAccountAddress: toAccountAddress,
          messenger: Messenger.ALLBRIDGE,
          sourceToken: grlChainToken,
          destinationToken: trxChainToken,
          gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
        };

        const gas = 100000;
        const estimateGasMocked = jest.fn(() => {
          return gas;
        });
        const transactionHash = "1234567890";
        const expectedData = "data";
        const encodeABIMocked = jest.fn(() => {
          return expectedData;
        });
        const swapAndBridgeMocked = jest.fn(() => {
          return {
            estimateGas: estimateGasMocked,
            encodeABI: encodeABIMocked,
          };
        });
        mockEvmBridgeContract({
          swapAndBridge: swapAndBridgeMocked,
        });
        const methodSendRawTransactionSpy = mockEvmSendRawTransaction(transactionHash);

        const transactionResponse = await sdk.bridge.send(new Web3(), sendParams);

        expect(swapAndBridgeMocked).toBeCalledTimes(1);
        expect(methodSendRawTransactionSpy).toHaveBeenCalledTimes(1);
        expect(methodSendRawTransactionSpy).toHaveBeenCalledWith({
          from: fromAccountAddress,
          to: grlChainToken.bridgeAddress,
          value: "0",
          data: expectedData,
        });

        const expectedTotalAmount = Big(totalAmountFloat)
          .mul(10 ** grlChainToken.decimals)
          .toFixed();
        const expectedFeeAmount = Big(feeInStablecoins)
          .mul(10 ** grlChainToken.decimals)
          .toFixed();
        expect(swapAndBridgeMocked).lastCalledWith(
          formatAddress(grlChainToken.tokenAddress, ChainType.EVM, ChainType.EVM),
          expectedTotalAmount,
          formatAddress(toAccountAddress, ChainType.TRX, ChainType.EVM),
          trxChainToken.allbridgeChainId,
          formatAddress(trxChainToken.tokenAddress, ChainType.TRX, ChainType.EVM),
          "0x" + nonceBuffer.toString("hex"),
          Messenger.ALLBRIDGE,
          expectedFeeAmount
        );
        expect(transactionResponse).toEqual({ txId: transactionHash });
        scope.done();
      });
    });

    describe("swap", () => {
      test("rawTxBuilder should build swapTx correctly for evm", async () => {
        const accountAddress = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
        const swapParams: SwapParams = {
          amount: "10",
          fromAccountAddress: accountAddress,
          toAccountAddress: accountAddress,
          sourceToken: grlChainToken,
          destinationToken: grlChainToken2,
          minimumReceiveAmount: "7",
        };

        const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(swapParams, new Web3());

        expect(rawTransactionTransfer).toEqual({
          data: "0x331838b20000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000ddac3cb57dea3fbeff4997d78215535eb5787117000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f4300000000000000000000000068d7ed9cf9881427f1db299b90fd63ef805dd10d0000000000000000000000000000000000000000000000006124fee993bc0000",
          from: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
          to: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        });
      });
      test("rawTxBuilder should build swapTx correctly for trx", async () => {
        const rawTx = "rawTx";
        const methodTriggerSmartContractMock = jest.fn(() => {
          return {
            result: {
              result: true,
            },
            transaction: rawTx,
          };
        });
        const tronWebMock: TronWeb = {
          transactionBuilder: {
            triggerSmartContract: methodTriggerSmartContractMock,
          },
        };
        const accountAddress = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN"; // cSpell:disable-line
        const minimumReceiveAmount = "7";
        const swapParams: SwapParams = {
          amount: "10",
          fromAccountAddress: accountAddress,
          toAccountAddress: accountAddress,
          sourceToken: trxChainToken,
          destinationToken: trxChainToken2,
          minimumReceiveAmount: minimumReceiveAmount,
        };

        const rawTransactionTransfer = await sdk.bridge.rawTxBuilder.send(swapParams, tronWebMock);
        expect(methodTriggerSmartContractMock).toBeCalledWith(
          trxChainToken.bridgeAddress,
          "swap(uint256,bytes32,bytes32,address,uint256)",
          { callValue: "0" },
          [
            {
              type: "uint256",
              value: convertFloatAmountToInt(swapParams.amount, trxChainToken.decimals).toFixed(),
            },
            {
              type: "bytes32",
              value: formatAddress(swapParams.sourceToken.tokenAddress, ChainType.TRX, ChainType.TRX),
            },
            {
              type: "bytes32",
              value: formatAddress(swapParams.destinationToken.tokenAddress, ChainType.TRX, ChainType.TRX),
            },
            { type: "address", value: accountAddress },
            {
              type: "uint256",
              value: convertFloatAmountToInt(minimumReceiveAmount, trxChainToken.decimals).toFixed(),
            },
          ],
          accountAddress
        );
        expect(rawTransactionTransfer).toEqual(rawTx);
      });
    });
  });

  describe("getTokenBalance", () => {
    test("should delegate call to bridge service", async () => {
      mockTokenService_getTokenBalance();

      const getTokenBalanceParams: GetTokenBalanceParams = {
        account: "account",
        token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      };

      const tokenBalance = await sdk.getTokenBalance(getTokenBalanceParams);
      expect(tokenBalance).toEqual(mockedTokenBalance);
    });
  });

  describe("getGasFeeOptions", () => {
    const sourceChainToken: TokenWithChainDetails = {
      ...basicTokenInfoWithChainDetails,
      decimals: 6,
    };
    const destinationChainToken: TokenWithChainDetails = basicTokenInfoWithChainDetails2;
    const fee = "20000000000000000";
    const sourceNativeTokenPrice = "1501.0000";
    const feeInStablecoins = "30.02"; // $30.02

    const scope: nock.Scope = nock("http://localhost");

    afterEach(() => {
      nockCleanAll();
    });

    test("☀️ getGasFeeOptions() returns GasFeeOptions", async () => {
      scope
        .post("/receive-fee")
        .reply(201, {
          fee,
          sourceNativeTokenPrice,
        })
        .persist();

      const expectedFeeAmountInStablecoin = Big(feeInStablecoins)
        .mul(10 ** sourceChainToken.decimals)
        .toFixed();
      const expected: GasFeeOptions = {
        [FeePaymentMethod.WITH_NATIVE_CURRENCY]: {
          [AmountFormat.INT]: fee,
          [AmountFormat.FLOAT]: convertIntAmountToFloat(fee, ChainDecimalsByType[sourceChainToken.chainType]).toFixed(),
        },
        [FeePaymentMethod.WITH_STABLECOIN]: {
          [AmountFormat.INT]: expectedFeeAmountInStablecoin,
          [AmountFormat.FLOAT]: convertIntAmountToFloat(
            expectedFeeAmountInStablecoin,
            sourceChainToken.decimals
          ).toFixed(),
        },
      };

      const actual = await sdk.getGasFeeOptions(sourceChainToken, destinationChainToken, Messenger.ALLBRIDGE);
      expect(actual).toEqual(expected);

      scope.done();
    });

    test("☀️ getGasFeeOptions() returns GasFeeOptions (only native)", async () => {
      scope
        .post("/receive-fee")
        .reply(201, {
          fee,
        })
        .persist();

      const expected: GasFeeOptions = {
        [FeePaymentMethod.WITH_NATIVE_CURRENCY]: {
          [AmountFormat.INT]: fee,
          [AmountFormat.FLOAT]: convertIntAmountToFloat(fee, ChainDecimalsByType[sourceChainToken.chainType]).toFixed(),
        },
      };

      const actual = await sdk.getGasFeeOptions(sourceChainToken, destinationChainToken, Messenger.ALLBRIDGE);
      expect(actual).toEqual(expected);

      scope.done();
    });
  });
});
