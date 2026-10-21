import nock, { cleanAll as nockCleanAll } from "nock";
import { ChainSymbol, ChainType } from "../../../chains/chain.enums";
import { LifiIntentsOrderResponse, LifiIntentsQuoteResponse } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  AllbridgeCoreSdk,
  AllbridgeCoreSdkOptions,
  FeePaymentMethod,
  InvalidGasFeePaymentOptionError,
  isLifiIntentsRouteSupported,
  LifiIntentsAmountTooHighError,
  LifiIntentsAmountTooLowError,
  LifiIntentsDoesNotSupportedError,
  LifiIntentsNoQuoteError,
  Messenger,
  SdkError,
  TokenWithChainDetails,
} from "../../../index";
import { NodeRpcUrlsConfig } from "../../../services";
import { DefaultBridgeService, getSpender } from "../../../services/bridge";
import { EvmBridgeService } from "../../../services/bridge/evm";
import { DefaultLifiIntentsService, LifiIntentsService } from "../../../services/lifi-intents";
import { TokenService } from "../../../services/token";
import { getRequestBodyMatcher, initChainsWithTestnet } from "../../mock/utils";

initChainsWithTestnet();

const bridgeAddress = "0xc5F40962983d41c2551139181EF3B2f73a4168be";
const sender = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
const recipient = "0x76b4c56085ED136a8744D52bE956396624a730E8";
const orderId = "0x" + "ab".repeat(32);

const destinationToken = {
  chainSymbol: ChainSymbol.ARB,
  chainType: ChainType.EVM,
  allbridgeChainId: 6,
  decimals: 6,
  symbol: "USDC",
  tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  lifiIntents: {},
} as TokenWithChainDetails;

const sourceToken = {
  chainSymbol: "GRL" as ChainSymbol,
  chainType: ChainType.EVM,
  allbridgeChainId: 2,
  decimals: 18,
  symbol: "USDT",
  tokenAddress: "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43",
  lifiIntents: {
    bridgeAddress,
    // listed lowercase on purpose: the match is case-insensitive
    destinations: { [ChainSymbol.ARB]: [destinationToken.tokenAddress.toLowerCase()] },
  },
} as TokenWithChainDetails;

const nativeSourceToken = {
  ...sourceToken,
  symbol: "ETH",
  tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  isNative: true,
} as TokenWithChainDetails;

const quoteResponse: LifiIntentsQuoteResponse = {
  amountIn: "1500000000000000000",
  amountOut: "1490000",
  fee: "1500000000000000",
  timeEstimate: 30,
};

const orderResponse: LifiIntentsOrderResponse = {
  ...quoteResponse,
  orderId,
  validUntil: 4070908800,
  fillDeadline: 4070909400,
  approval: { token: sourceToken.tokenAddress, spender: bridgeAddress, amount: "1500000000000000000" },
  tx: { contractAddress: bridgeAddress, value: "0", tx: "0xdeadbeef" },
};

const testConfig: AllbridgeCoreSdkOptions = {
  coreApiUrl: "http://localhost",
  solanaLookUpTable: "solanaLookUpTable",
  sorobanNetworkPassphrase: "sorobanNetworkPassphrase",
  jupiterUrl: "",
  cctpParams: {
    cctpDomains: {},
    cctpTransmitterProgramId: "",
    cctpTokenMessengerMinter: "",
    cctpV2TransmitterProgramId: "",
    cctpV2TokenMessengerMinter: "",
  },
};

describe("LI.FI Intents", () => {
  describe("isLifiIntentsRouteSupported", () => {
    test("☀ true when the source has the bridge and lists the destination token", () => {
      expect(isLifiIntentsRouteSupported(sourceToken, destinationToken)).toBe(true);
      expect(isLifiIntentsRouteSupported(nativeSourceToken, destinationToken)).toBe(true);
    });

    test("☁ false without the bridge, without the destination, for a non-EVM source or the same chain", () => {
      expect(isLifiIntentsRouteSupported({ ...sourceToken, lifiIntents: undefined }, destinationToken)).toBe(false);
      expect(isLifiIntentsRouteSupported({ ...sourceToken, lifiIntents: {} }, destinationToken)).toBe(false);
      expect(
        isLifiIntentsRouteSupported(
          { ...sourceToken, lifiIntents: { bridgeAddress, destinations: { [ChainSymbol.ARB]: [] } } },
          destinationToken
        )
      ).toBe(false);
      expect(
        isLifiIntentsRouteSupported(sourceToken, {
          ...destinationToken,
          tokenAddress: "0x0000000000000000000000000000000000000001",
        })
      ).toBe(false);
      expect(isLifiIntentsRouteSupported(sourceToken, { ...destinationToken, chainSymbol: ChainSymbol.ETH })).toBe(
        false
      );
      expect(
        isLifiIntentsRouteSupported(
          { ...sourceToken, chainSymbol: ChainSymbol.TRX, chainType: ChainType.TRX },
          destinationToken
        )
      ).toBe(false);
      expect(isLifiIntentsRouteSupported(sourceToken, { ...destinationToken, chainSymbol: "GRL" as ChainSymbol })).toBe(
        false
      );
    });
  });

  describe("SDK amount computes with Messenger.LIFI_INTENTS", () => {
    const sdk = new AllbridgeCoreSdk({}, testConfig);

    afterEach(() => {
      nockCleanAll();
    });

    test("☀ getAmountToBeReceived quotes EXACT_INPUT in source decimals and returns amountOut in destination decimals", async () => {
      const scope = nock("http://localhost")
        .post(
          "/lifi-intents/quote",
          getRequestBodyMatcher({
            sourceChainId: 2,
            sourceToken: sourceToken.tokenAddress,
            destinationChainId: 6,
            destinationToken: destinationToken.tokenAddress,
            amount: "1500000000000000000",
            swapType: "EXACT_INPUT",
          })
        )
        .reply(200, quoteResponse);

      const actual = await sdk.getAmountToBeReceived("1.5", sourceToken, destinationToken, Messenger.LIFI_INTENTS);

      expect(actual).toEqual("1.49");
      scope.done();
    });

    test("☀ getAmountToSend quotes EXACT_OUTPUT in destination decimals and returns amountIn in source decimals", async () => {
      const scope = nock("http://localhost")
        .post(
          "/lifi-intents/quote",
          getRequestBodyMatcher({
            sourceChainId: 2,
            sourceToken: sourceToken.tokenAddress,
            destinationChainId: 6,
            destinationToken: destinationToken.tokenAddress,
            amount: "1490000",
            swapType: "EXACT_OUTPUT",
          })
        )
        .reply(200, quoteResponse);

      const actual = await sdk.getAmountToSend("1.49", sourceToken, destinationToken, Messenger.LIFI_INTENTS);

      expect(actual).toEqual("1.5");
      scope.done();
    });

    test("☁ getAmountToBeReceived throws LifiIntentsDoesNotSupportedError for an unsupported route", async () => {
      await expect(
        sdk.getAmountToBeReceived(
          "1.5",
          { ...sourceToken, lifiIntents: { bridgeAddress } },
          destinationToken,
          Messenger.LIFI_INTENTS
        )
      ).rejects.toBeInstanceOf(LifiIntentsDoesNotSupportedError);
      await expect(
        sdk.getAmountToSend(
          "1.49",
          { ...sourceToken, lifiIntents: undefined },
          destinationToken,
          Messenger.LIFI_INTENTS
        )
      ).rejects.toBeInstanceOf(LifiIntentsDoesNotSupportedError);
      expect(nock.pendingMocks()).toEqual([]);
    });

    test("☁ getAmountToSend validates the amount decimals against the destination token", async () => {
      await expect(
        sdk.getAmountToSend("1.0000001", sourceToken, destinationToken, Messenger.LIFI_INTENTS)
      ).rejects.toThrow("cannot be greater than '6'");
    });

    test("☁ getAmountToBeReceived surfaces AMOUNT_TOO_LOW and AMOUNT_TOO_HIGH as typed errors", async () => {
      nock("http://localhost")
        .post("/lifi-intents/quote")
        .reply(400, { code: "AMOUNT_TOO_LOW", message: "Amount is too low", minAmount: "1000000000000000000" });
      const tooLow = await sdk
        .getAmountToBeReceived("0.01", sourceToken, destinationToken, Messenger.LIFI_INTENTS)
        .catch((e: unknown) => e);
      expect(tooLow).toBeInstanceOf(LifiIntentsAmountTooLowError);
      expect(tooLow).toMatchObject({ minAmount: "1000000000000000000" });

      nock("http://localhost")
        .post("/lifi-intents/quote")
        .reply(400, { code: "AMOUNT_TOO_HIGH", message: "Amount is too high", maxAmount: "5000000000000000000" });
      const tooHigh = await sdk
        .getAmountToBeReceived("10", sourceToken, destinationToken, Messenger.LIFI_INTENTS)
        .catch((e: unknown) => e);
      expect(tooHigh).toBeInstanceOf(LifiIntentsAmountTooHighError);
      expect(tooHigh).toMatchObject({ maxAmount: "5000000000000000000" });
    });

    test("☁ getAmountToBeReceived surfaces NO_QUOTE as LifiIntentsNoQuoteError", async () => {
      nock("http://localhost").post("/lifi-intents/quote").reply(404, { code: "NO_QUOTE", message: "No quote" });
      await expect(
        sdk.getAmountToBeReceived("1.5", sourceToken, destinationToken, Messenger.LIFI_INTENTS)
      ).rejects.toBeInstanceOf(LifiIntentsNoQuoteError);
    });

    test("☀ getGasFeeOptions returns the zero fee and does not offer ABR", async () => {
      const scope = nock("http://localhost")
        .post(
          "/receive-fee",
          getRequestBodyMatcher({
            sourceChainId: 2,
            destinationChainId: 6,
            messenger: Messenger.LIFI_INTENTS,
            sourceToken: sourceToken.tokenAddress,
          })
        )
        .reply(201, { fee: "0", exchangeRate: "1", sourceNativeTokenPrice: "2000", abrExchangeRate: "1" });
      const tokenWithAbrPayer = {
        ...sourceToken,
        abrPayer: {
          payerAddress: "0x0000000000000000000000000000000000000001",
          abrToken: { chainSymbol: "GRL", tokenAddress: "0x0000000000000000000000000000000000000002", decimals: 18 },
          payerAvailability: { [Messenger.CCTP]: true },
        },
      } as unknown as TokenWithChainDetails;

      const actual = await sdk.getGasFeeOptions(tokenWithAbrPayer, destinationToken, Messenger.LIFI_INTENTS);

      expect(actual[FeePaymentMethod.WITH_NATIVE_CURRENCY]).toEqual({ int: "0", float: "0" });
      expect(actual[FeePaymentMethod.WITH_ABR]).toBeUndefined();
      scope.done();
    });

    test("☀ getExtraGasMaxLimits returns zero limits", async () => {
      const scope = nock("http://localhost")
        .post("/receive-fee")
        .reply(201, { fee: "0", exchangeRate: "1", sourceNativeTokenPrice: "2000" });

      // another source token: the /receive-fee answer of the previous test is cached per route and token
      const actual = await sdk.getExtraGasMaxLimits(
        { ...sourceToken, tokenAddress: "0x0000000000000000000000000000000000000abc" },
        { ...destinationToken, txCostAmount: { maxAmount: "0", swap: "0", transfer: "0" } },
        Messenger.LIFI_INTENTS
      );

      expect(actual.extraGasMax).toEqual({ [FeePaymentMethod.WITH_NATIVE_CURRENCY]: { int: "0", float: "0" } });
      scope.done();
    });

    test("☀ sdk.lifiIntents is wired", () => {
      expect(sdk.lifiIntents).toBeInstanceOf(DefaultLifiIntentsService);
    });
  });

  describe("DefaultLifiIntentsService", () => {
    let api: {
      getLifiIntentsQuote: jest.Mock;
      createLifiIntentsOrder: jest.Mock;
    };
    let service: DefaultLifiIntentsService;

    beforeEach(() => {
      api = {
        getLifiIntentsQuote: jest.fn().mockResolvedValue(quoteResponse),
        createLifiIntentsOrder: jest.fn().mockResolvedValue(orderResponse),
      };
      service = new DefaultLifiIntentsService(api as unknown as AllbridgeCoreClient);
    });

    test("☀ getQuote defaults to EXACT_INPUT and returns float amounts", async () => {
      const actual = await service.getQuote({ amount: "1.5", sourceToken, destinationToken });

      expect(api.getLifiIntentsQuote).toHaveBeenCalledWith({
        sourceChainId: 2,
        sourceToken: sourceToken.tokenAddress,
        destinationChainId: 6,
        destinationToken: destinationToken.tokenAddress,
        amount: "1500000000000000000",
        swapType: "EXACT_INPUT",
      });
      expect(actual).toEqual({ amountIn: "1.5", amountOut: "1.49", fee: "0.0015", timeEstimate: 30 });
    });

    test("☀ createOrder posts sender, recipient and app core, returns dates and float amounts", async () => {
      const actual = await service.createOrder({
        amount: "1.49",
        swapType: "EXACT_OUTPUT",
        sourceToken,
        destinationToken,
        fromAccountAddress: sender,
        toAccountAddress: recipient,
      });

      expect(api.createLifiIntentsOrder).toHaveBeenCalledWith({
        sourceChainId: 2,
        sourceToken: sourceToken.tokenAddress,
        destinationChainId: 6,
        destinationToken: destinationToken.tokenAddress,
        amount: "1490000",
        swapType: "EXACT_OUTPUT",
        sender,
        recipient,
        app: "core",
      });
      expect(actual).toEqual({
        orderId,
        sender,
        recipient,
        amountIn: "1.5",
        amountOut: "1.49",
        fee: "0.0015",
        timeEstimate: 30,
        validUntil: new Date("2099-01-01T00:00:00.000Z"),
        fillDeadline: new Date("2099-01-01T00:10:00.000Z"),
        approval: { token: sourceToken.tokenAddress, spender: bridgeAddress, amount: "1.5" },
        transaction: { contractAddress: bridgeAddress, value: "0", data: "0xdeadbeef" },
      });
    });

    test("☀ createOrder leaves approval undefined for a native token", async () => {
      api.createLifiIntentsOrder.mockResolvedValueOnce({
        ...orderResponse,
        approval: undefined,
        tx: { contractAddress: bridgeAddress, value: "1500000000000000000", tx: "0xfeed" },
      });

      const actual = await service.createOrder({
        amount: "1.5",
        sourceToken: nativeSourceToken,
        destinationToken,
        fromAccountAddress: sender,
        toAccountAddress: recipient,
      });

      expect(actual.approval).toBeUndefined();
      expect(actual.transaction).toEqual({
        contractAddress: bridgeAddress,
        value: "1500000000000000000",
        data: "0xfeed",
      });
    });

    test("☁ getQuote throws LifiIntentsDoesNotSupportedError for an unsupported route without a request", async () => {
      await expect(
        service.getQuote({ amount: "1.5", sourceToken: { ...sourceToken, lifiIntents: {} }, destinationToken })
      ).rejects.toBeInstanceOf(LifiIntentsDoesNotSupportedError);
      expect(api.getLifiIntentsQuote).not.toHaveBeenCalled();
    });

    describe("buildSendTransaction", () => {
      const sendParams = {
        amount: "1.5",
        fromAccountAddress: sender,
        toAccountAddress: recipient,
        sourceToken,
        destinationToken,
      };

      test("☀ creates an EXACT_INPUT order and returns its transaction", async () => {
        const actual = await service.buildSendTransaction(sendParams);

        expect(api.createLifiIntentsOrder).toHaveBeenCalledWith(
          expect.objectContaining({ amount: "1500000000000000000", swapType: "EXACT_INPUT", sender, recipient })
        );
        expect(actual.rawTransaction).toEqual({ from: sender, to: bridgeAddress, value: "0", data: "0xdeadbeef" });
        expect(actual.order.orderId).toEqual(orderId);
      });

      test("☀ attaches the value for a native source token", async () => {
        api.createLifiIntentsOrder.mockResolvedValueOnce({
          ...orderResponse,
          approval: undefined,
          tx: { contractAddress: bridgeAddress, value: "1500000000000000000", tx: "0xfeed" },
        });

        const actual = await service.buildSendTransaction({ ...sendParams, sourceToken: nativeSourceToken });

        expect(actual.rawTransaction).toEqual({
          from: sender,
          to: bridgeAddress,
          value: "1500000000000000000",
          data: "0xfeed",
        });
      });

      test("☀ reuses the passed order", async () => {
        const order = await service.createOrder({ ...sendParams, swapType: "EXACT_INPUT" });
        api.createLifiIntentsOrder.mockClear();

        const actual = await service.buildSendTransaction({ ...sendParams, lifiIntentsOrder: order });

        expect(api.createLifiIntentsOrder).not.toHaveBeenCalled();
        expect(actual.order).toBe(order);
        expect(actual.rawTransaction).toEqual({ from: sender, to: bridgeAddress, value: "0", data: "0xdeadbeef" });
      });

      test("☁ rejects a passed order whose amountIn, sender or recipient differ", async () => {
        const order = await service.createOrder({ ...sendParams, swapType: "EXACT_INPUT" });

        await expect(
          service.buildSendTransaction({ ...sendParams, amount: "2", lifiIntentsOrder: order })
        ).rejects.toThrow("does not match the amount to send");
        await expect(
          service.buildSendTransaction({ ...sendParams, fromAccountAddress: recipient, lifiIntentsOrder: order })
        ).rejects.toThrow("another sender or recipient");
        await expect(
          service.buildSendTransaction({ ...sendParams, toAccountAddress: sender, lifiIntentsOrder: order })
        ).rejects.toThrow("another sender or recipient");
      });

      test("☀ accepts a passed order with differently cased addresses", async () => {
        const order = await service.createOrder({ ...sendParams, swapType: "EXACT_INPUT" });

        const actual = await service.buildSendTransaction({
          ...sendParams,
          fromAccountAddress: sender.toLowerCase(),
          toAccountAddress: recipient.toUpperCase().replace("0X", "0x"),
          lifiIntentsOrder: order,
        });

        expect(actual.rawTransaction).toMatchObject({ from: sender.toLowerCase(), to: bridgeAddress });
      });

      test("☁ rejects an order past its fill deadline", async () => {
        api.createLifiIntentsOrder.mockResolvedValueOnce({ ...orderResponse, fillDeadline: 946684800 });

        const error = await service.buildSendTransaction(sendParams).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(SdkError);
        expect(error).toMatchObject({ message: expect.stringContaining("fill deadline has passed") });
      });

      test("☁ throws for an unsupported route without a request", async () => {
        await expect(
          service.buildSendTransaction({
            ...sendParams,
            sourceToken: { ...sourceToken, chainSymbol: ChainSymbol.TRX, chainType: ChainType.TRX },
          })
        ).rejects.toBeInstanceOf(LifiIntentsDoesNotSupportedError);
        expect(api.createLifiIntentsOrder).not.toHaveBeenCalled();
      });
    });
  });

  describe("Allowance with Messenger.LIFI_INTENTS", () => {
    const tokenService = {
      getAllowance: jest.fn().mockResolvedValue("1000"),
      checkAllowance: jest.fn().mockResolvedValue(false),
      approve: jest.fn(),
      buildRawTransactionApprove: jest.fn().mockResolvedValue({ to: sourceToken.tokenAddress }),
      getTokenBalance: jest.fn(),
      getNativeTokenBalance: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;
    const bridgeService = new DefaultBridgeService(
      {} as AllbridgeCoreClient,
      new NodeRpcUrlsConfig({}),
      testConfig,
      tokenService
    );
    const params = { token: sourceToken, owner: sender, messenger: Messenger.LIFI_INTENTS };

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("☀ the spender is the LifiIntentsBridge", async () => {
      expect(getSpender(sourceToken, Messenger.LIFI_INTENTS)).toEqual(bridgeAddress);

      await bridgeService.getAllowance(params);
      expect(tokenService.getAllowance).toHaveBeenCalledWith({ ...params, spender: bridgeAddress }, undefined);

      expect(await bridgeService.checkAllowance({ ...params, amount: "1.5" })).toBe(false);
      expect(tokenService.checkAllowance).toHaveBeenCalledWith(
        { ...params, amount: "1.5", spender: bridgeAddress },
        undefined
      );

      await bridgeService.rawTxBuilder.approve(params);
      expect(tokenService.buildRawTransactionApprove).toHaveBeenCalledWith(
        { ...params, spender: bridgeAddress },
        undefined
      );
    });

    test("☀ a native source token needs no approval: checkAllowance is true, approve throws", async () => {
      const nativeParams = { ...params, token: nativeSourceToken };

      expect(await bridgeService.checkAllowance({ ...nativeParams, amount: "1.5" })).toBe(true);
      expect(tokenService.checkAllowance).not.toHaveBeenCalled();
      await expect(bridgeService.rawTxBuilder.approve(nativeParams)).rejects.toThrow("needs no approval");
      expect(() => getSpender(nativeSourceToken, Messenger.LIFI_INTENTS)).toThrow("needs no approval");
    });

    test("☁ a token without the bridge throws LifiIntentsDoesNotSupportedError", () => {
      expect(() => getSpender({ ...sourceToken, lifiIntents: {} }, Messenger.LIFI_INTENTS)).toThrow(
        LifiIntentsDoesNotSupportedError
      );
    });

    test("☁ paying with ABR is rejected", () => {
      expect(() => getSpender(sourceToken, Messenger.LIFI_INTENTS, FeePaymentMethod.WITH_ABR)).toThrow(
        InvalidGasFeePaymentOptionError
      );
    });
  });

  describe("bridge.send (deprecated) with Messenger.LIFI_INTENTS", () => {
    const sendParams = {
      amount: "1.5",
      fromAccountAddress: sender,
      toAccountAddress: recipient,
      sourceToken,
      destinationToken,
      messenger: Messenger.LIFI_INTENTS,
    };
    const rawTransaction = { from: sender, to: bridgeAddress, value: "0", data: "0xdeadbeef" };
    let lifiIntentsService: jest.Mocked<LifiIntentsService>;
    let bridgeService: DefaultBridgeService;

    beforeEach(() => {
      lifiIntentsService = {
        getQuote: jest.fn(),
        createOrder: jest.fn(),
        buildSendTransaction: jest.fn().mockResolvedValue({ rawTransaction, order: { orderId } }),
      };
      bridgeService = new DefaultBridgeService(
        {} as AllbridgeCoreClient,
        new NodeRpcUrlsConfig({}),
        testConfig,
        {} as TokenService,
        undefined,
        lifiIntentsService
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("☀ sends the order transaction with the EVM provider", async () => {
      const sendRawTransaction = jest
        .spyOn(EvmBridgeService.prototype, "sendRawTransaction")
        .mockResolvedValue({ txId: "evm-tx-id" });
      const web3 = {} as any;

      const actual = await bridgeService.send(web3, sendParams);

      expect(actual).toEqual({ txId: "evm-tx-id" });
      expect(lifiIntentsService.buildSendTransaction).toHaveBeenCalledWith(sendParams);
      expect(sendRawTransaction).toHaveBeenCalledWith(rawTransaction);
    });

    test("☁ rejects extra gas and a non-zero fee before building the order", async () => {
      await expect(bridgeService.send({} as any, { ...sendParams, extraGas: "1000" })).rejects.toBeInstanceOf(
        InvalidGasFeePaymentOptionError
      );
      await expect(bridgeService.send({} as any, { ...sendParams, fee: "1" })).rejects.toBeInstanceOf(
        InvalidGasFeePaymentOptionError
      );
      await expect(
        bridgeService.send({} as any, { ...sendParams, gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN })
      ).rejects.toBeInstanceOf(InvalidGasFeePaymentOptionError);
      expect(lifiIntentsService.buildSendTransaction).not.toHaveBeenCalled();
    });
  });
});
