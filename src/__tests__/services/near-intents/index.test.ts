import nock, { cleanAll as nockCleanAll } from "nock";
import { ChainSymbol, ChainType } from "../../../chains/chain.enums";
import { NearIntentsDepositResponse, NearIntentsQuoteResponse } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import {
  AllbridgeCoreSdk,
  AllbridgeCoreSdkOptions,
  FeePaymentMethod,
  Messenger,
  NearIntentsAmountTooLowError,
  NearIntentsDoesNotSupportedError,
  TokenWithChainDetails,
} from "../../../index";
import { NodeRpcUrlsConfig } from "../../../services";
import { DefaultBridgeService, getSpender } from "../../../services/bridge";
import { DefaultNearIntentsService } from "../../../services/near-intents";
import { TokenService } from "../../../services/token";
import { EvmTokenService } from "../../../services/token/evm";
import { getRequestBodyMatcher, initChainsWithTestnet } from "../../mock/utils";

initChainsWithTestnet();

const sourceToken = {
  chainSymbol: "GRL" as ChainSymbol,
  chainType: ChainType.EVM,
  allbridgeChainId: 2,
  decimals: 18,
  symbol: "USDT",
  tokenAddress: "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43",
  nearIntents: { assetId: "nep141:eth-0xc7db.omft.near" },
} as TokenWithChainDetails;

const destinationToken = {
  chainSymbol: ChainSymbol.TRX,
  chainType: ChainType.TRX,
  allbridgeChainId: 4,
  decimals: 6,
  symbol: "USDT",
  tokenAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // cSpell:disable-line
  nearIntents: { assetId: "nep141:tron-d28a.omft.near" },
} as TokenWithChainDetails;

const quoteResponse: NearIntentsQuoteResponse = {
  amountIn: "1500000000000000000",
  amountOut: "1490000",
  minAmountOut: "1475100",
  timeEstimate: 25,
  amountInUsd: "1.50",
  amountOutUsd: "1.49",
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

describe("NEAR Intents", () => {
  describe("SDK amount computes with Messenger.NEAR_INTENTS", () => {
    const sdk = new AllbridgeCoreSdk({}, testConfig);

    afterEach(() => {
      nockCleanAll();
    });

    test("☀ getAmountToBeReceived quotes EXACT_INPUT in source decimals and returns amountOut in destination decimals", async () => {
      const scope = nock("http://localhost")
        .post(
          "/near-intents/quote",
          getRequestBodyMatcher({
            sourceChainId: 2,
            sourceToken: sourceToken.tokenAddress,
            destinationChainId: 4,
            destinationToken: destinationToken.tokenAddress,
            amount: "1500000000000000000",
            swapType: "EXACT_INPUT",
          })
        )
        .reply(200, quoteResponse);

      const actual = await sdk.getAmountToBeReceived("1.5", sourceToken, destinationToken, Messenger.NEAR_INTENTS);

      expect(actual).toEqual("1.49");
      scope.done();
    });

    test("☀ getAmountToSend quotes EXACT_OUTPUT in destination decimals and returns amountIn in source decimals", async () => {
      const scope = nock("http://localhost")
        .post(
          "/near-intents/quote",
          getRequestBodyMatcher({
            sourceChainId: 2,
            sourceToken: sourceToken.tokenAddress,
            destinationChainId: 4,
            destinationToken: destinationToken.tokenAddress,
            amount: "1490000",
            swapType: "EXACT_OUTPUT",
          })
        )
        .reply(200, quoteResponse);

      const actual = await sdk.getAmountToSend("1.49", sourceToken, destinationToken, Messenger.NEAR_INTENTS);

      expect(actual).toEqual("1.5");
      scope.done();
    });

    test("☁ getAmountToBeReceived throws NearIntentsDoesNotSupportedError when a token lacks nearIntents", async () => {
      await expect(
        sdk.getAmountToBeReceived(
          "1.5",
          sourceToken,
          { ...destinationToken, nearIntents: undefined },
          Messenger.NEAR_INTENTS
        )
      ).rejects.toBeInstanceOf(NearIntentsDoesNotSupportedError);
      await expect(
        sdk.getAmountToSend(
          "1.49",
          { ...sourceToken, nearIntents: undefined },
          destinationToken,
          Messenger.NEAR_INTENTS
        )
      ).rejects.toBeInstanceOf(NearIntentsDoesNotSupportedError);
      expect(nock.pendingMocks()).toEqual([]);
    });

    test("☁ getAmountToSend validates the amount decimals against the destination token", async () => {
      await expect(
        sdk.getAmountToSend("1.0000001", sourceToken, destinationToken, Messenger.NEAR_INTENTS)
      ).rejects.toThrow("cannot be greater than '6'");
    });

    test("☁ getAmountToBeReceived surfaces AMOUNT_TOO_LOW as NearIntentsAmountTooLowError", async () => {
      nock("http://localhost")
        .post("/near-intents/quote")
        .reply(400, { code: "AMOUNT_TOO_LOW", message: "Amount is too low", minAmountUsd: "1000" });

      const error = await sdk
        .getAmountToBeReceived("0.01", sourceToken, destinationToken, Messenger.NEAR_INTENTS)
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(NearIntentsAmountTooLowError);
      expect(error).toMatchObject({ minAmountUsd: "1000" });
    });

    test("☀ getGasFeeOptions returns the zero fee and does not offer ABR", async () => {
      const scope = nock("http://localhost")
        .post(
          "/receive-fee",
          getRequestBodyMatcher({
            sourceChainId: 2,
            destinationChainId: 4,
            messenger: Messenger.NEAR_INTENTS,
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

      const actual = await sdk.getGasFeeOptions(tokenWithAbrPayer, destinationToken, Messenger.NEAR_INTENTS);

      expect(actual[FeePaymentMethod.WITH_NATIVE_CURRENCY]).toEqual({ int: "0", float: "0" });
      expect(actual[FeePaymentMethod.WITH_ABR]).toBeUndefined();
      scope.done();
    });

    test("☀ sdk.nearIntents is wired", () => {
      expect(sdk.nearIntents).toBeInstanceOf(DefaultNearIntentsService);
    });
  });

  describe("DefaultNearIntentsService", () => {
    const depositResponse: NearIntentsDepositResponse = {
      depositAddress: "0x76b4c56085ED136a8744D52bE956396624a730E8",
      depositMemo: "memo",
      amountIn: "1500000000000000000",
      amountOut: "1490000",
      minAmountOut: "1475100",
      deadline: "2099-01-01T00:00:00.000Z",
      timeWhenInactive: "2099-01-02T00:00:00.000Z",
      timeEstimate: 25,
    };
    let api: {
      getNearIntentsQuote: jest.Mock;
      createNearIntentsDeposit: jest.Mock;
      submitNearIntentsDeposit: jest.Mock;
    };
    let service: DefaultNearIntentsService;

    beforeEach(() => {
      api = {
        getNearIntentsQuote: jest.fn().mockResolvedValue(quoteResponse),
        createNearIntentsDeposit: jest.fn().mockResolvedValue(depositResponse),
        submitNearIntentsDeposit: jest.fn().mockResolvedValue(undefined),
      };
      service = new DefaultNearIntentsService(
        api as unknown as AllbridgeCoreClient,
        new NodeRpcUrlsConfig({}),
        testConfig
      );
    });

    test("☀ getQuote defaults to EXACT_INPUT and returns float amounts", async () => {
      const actual = await service.getQuote({ amount: "1.5", sourceToken, destinationToken });

      expect(api.getNearIntentsQuote).toHaveBeenCalledWith({
        sourceChainId: 2,
        sourceToken: sourceToken.tokenAddress,
        destinationChainId: 4,
        destinationToken: destinationToken.tokenAddress,
        amount: "1500000000000000000",
        swapType: "EXACT_INPUT",
      });
      expect(actual).toEqual({
        amountIn: "1.5",
        amountOut: "1.49",
        minAmountOut: "1.4751",
        timeEstimate: 25,
        amountInUsd: "1.50",
        amountOutUsd: "1.49",
      });
    });

    test("☀ createDeposit passes recipient and refundTo and returns dates", async () => {
      const actual = await service.createDeposit({
        amount: "1.49",
        swapType: "EXACT_OUTPUT",
        sourceToken,
        destinationToken,
        fromAccountAddress: "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d",
        toAccountAddress: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax", // cSpell:disable-line
      });

      expect(api.createNearIntentsDeposit).toHaveBeenCalledWith({
        sourceChainId: 2,
        sourceToken: sourceToken.tokenAddress,
        destinationChainId: 4,
        destinationToken: destinationToken.tokenAddress,
        amount: "1490000",
        swapType: "EXACT_OUTPUT",
        recipient: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax", // cSpell:disable-line
        refundTo: "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d",
      });
      expect(actual).toEqual({
        depositAddress: depositResponse.depositAddress,
        depositMemo: "memo",
        amountIn: "1.5",
        amountOut: "1.49",
        minAmountOut: "1.4751",
        deadline: new Date("2099-01-01T00:00:00.000Z"),
        timeWhenInactive: new Date("2099-01-02T00:00:00.000Z"),
        timeEstimate: 25,
      });
    });

    test("☀ submitDeposit swallows errors", async () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
      api.submitNearIntentsDeposit.mockRejectedValue(new Error("502"));

      await expect(
        service.submitDeposit({ depositAddress: depositResponse.depositAddress, txId: "0xabc" })
      ).resolves.toBeUndefined();

      expect(api.submitNearIntentsDeposit).toHaveBeenCalledWith({
        depositAddress: depositResponse.depositAddress,
        depositMemo: undefined,
        txId: "0xabc",
      });
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe("Allowance with Messenger.NEAR_INTENTS", () => {
    const tokenService = {
      getAllowance: jest.fn(),
      checkAllowance: jest.fn(),
      approve: jest.fn(),
      buildRawTransactionApprove: jest.fn(),
      getTokenBalance: jest.fn(),
      getNativeTokenBalance: jest.fn(),
    } as unknown as jest.Mocked<TokenService>;
    const bridgeService = new DefaultBridgeService(
      {} as AllbridgeCoreClient,
      new NodeRpcUrlsConfig({}),
      testConfig,
      tokenService
    );
    const params = {
      token: sourceToken,
      owner: "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d",
      messenger: Messenger.NEAR_INTENTS,
    };

    test("☀ checkAllowance returns true without reading the chain", async () => {
      expect(await bridgeService.checkAllowance({ ...params, amount: "1000" })).toBe(true);
      expect(tokenService.checkAllowance).not.toHaveBeenCalled();
    });

    test("☁ getAllowance, approve and getSpender throw: no approval needed", async () => {
      await expect(bridgeService.getAllowance(params)).rejects.toThrow("NEAR Intents transfers need no approval");
      await expect(bridgeService.rawTxBuilder.approve(params)).rejects.toThrow(
        "NEAR Intents transfers need no approval"
      );
      expect(() => getSpender(sourceToken, Messenger.NEAR_INTENTS)).toThrow("NEAR Intents transfers need no approval");
      expect(tokenService.getAllowance).not.toHaveBeenCalled();
      expect(tokenService.buildRawTransactionApprove).not.toHaveBeenCalled();
    });
  });

  describe("EvmTokenService.getTokenBalance", () => {
    test("☀ reads the native balance for a native token", async () => {
      const getBalance = jest.fn().mockResolvedValue(1500000000000000000n);
      const web3 = { eth: { getBalance } } as any;
      const tokenService = new EvmTokenService(web3, {} as AllbridgeCoreClient);

      const actual = await tokenService.getTokenBalance({
        account: "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d",
        token: {
          chainSymbol: "GRL" as ChainSymbol,
          decimals: 18,
          tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          isNative: true,
        },
      });

      expect(actual).toEqual("1500000000000000000");
      expect(getBalance).toHaveBeenCalledWith("0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d");
    });
  });
});
