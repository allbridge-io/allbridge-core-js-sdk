/* cSpell:disable */

import bs58 from "bs58";
import nock, { Body, RequestBodyMatcher } from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { ChainSymbol, ChainType } from "../../../chains";
import {
  AllbridgeCoreClient,
  AllbridgeCoreClientImpl,
} from "../../../client/core-api";
import {
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../../../client/core-api/core-api.model";
import {
  SendParamsWithChainSymbols,
  TxSendParams,
} from "../../../services/bridge/models";
import { prepareTxSendParams } from "../../../services/bridge/utils";
import tokenInfoResponse from "../../mock/core-api/token-info.json";

describe("Utils", () => {
  let api: AllbridgeCoreClient;
  let scope: nock.Scope;

  beforeEach(() => {
    api = new AllbridgeCoreClientImpl({ apiUrl: "http://localhost" });
    scope = nock("http://localhost")
      .get("/token-info")
      .reply(200, tokenInfoResponse)
      .persist();
  });

  describe("prepareTxSendParams()", () => {
    const fee = "20000000000000000";
    const receiveFeeResponse: ReceiveTransactionCostResponse = { fee };
    const receiveFeeRequestEVMtoTRX: ReceiveTransactionCostRequest = {
      sourceChainId: 2,
      destinationChainId: 4,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeRequestEVMtoSOL: ReceiveTransactionCostRequest = {
      sourceChainId: 2,
      destinationChainId: 5,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeRequestTRXtoEVM: ReceiveTransactionCostRequest = {
      sourceChainId: 4,
      destinationChainId: 2,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeRequestTRXtoSOL: ReceiveTransactionCostRequest = {
      sourceChainId: 4,
      destinationChainId: 5,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeRequestSOLtoEVM: ReceiveTransactionCostRequest = {
      sourceChainId: 5,
      destinationChainId: 2,
      messenger: Messenger.ALLBRIDGE,
    };
    const receiveFeeRequestSOLtoTRX: ReceiveTransactionCostRequest = {
      sourceChainId: 5,
      destinationChainId: 4,
      messenger: Messenger.ALLBRIDGE,
    };
    beforeEach(() => {
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestEVMtoTRX))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestEVMtoSOL))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestTRXtoEVM))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestTRXtoSOL))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestSOLtoEVM))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestSOLtoTRX))
        .reply(201, receiveFeeResponse)
        .persist();
    });

    it("should return prepared TxSendParams for EVM->TRX blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.GRL,
        fromTokenAddress: "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43",
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",

        toChainSymbol: ChainSymbol.TRX,
        toTokenAddress: "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U",
        toAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.EVM,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromTokenAddress:
          "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        toChainId: 4,
        toTokenAddress:
          "0x000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b",
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        fee: "20000000000000000",
        toAccountAddress:
          "0x000000000000000000000000b83811067ab3a275ece28d3f8ec6875105ef9bae",
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for EVM->SOL blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.GRL,
        fromTokenAddress: "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43",
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",

        toChainSymbol: ChainSymbol.SOL,
        toTokenAddress: "f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L",
        toAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.EVM,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromTokenAddress:
          "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        toChainId: 5,
        toTokenAddress:
          "0x09c0917b1690e4929808fbc5378d9619a1ff49b3aaff441b2fa4bd58ab035a33",
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        fee: "20000000000000000",
        toAccountAddress:
          "0x583443dc4d82f958bdfce83c26d5ee2968af51d6f249e5181b2300c625a8cdf1",
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for TRX->EVM blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.TRX,
        fromTokenAddress: "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U",
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",

        toChainSymbol: ChainSymbol.GRL,
        toTokenAddress: "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43",
        toAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.TRX,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
        fromChainId: 4,
        fromTokenAddress: Array.from(
          bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")
        ),
        toChainId: 2,
        toTokenAddress: Array.from(
          bs58.decode("1111111111113nVbuaEbxzADW96189SLP23YyXkW")
        ),
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        fee: "20000000000000000",
        toAccountAddress: Array.from(
          bs58.decode("1111111111112TicWmEvkX7SrURa6r3JeZwDiG7n")
        ),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for TRX->SOL blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.TRX,
        fromTokenAddress: "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U",
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",

        toChainSymbol: ChainSymbol.SOL,
        toTokenAddress: "f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L",
        toAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.TRX,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
        fromChainId: 4,
        fromTokenAddress: Array.from(
          bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")
        ),
        toChainId: 5,
        toTokenAddress: Array.from(
          bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")
        ),
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        fee: "20000000000000000",
        toAccountAddress: Array.from(
          bs58.decode("6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr")
        ),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for SOL->EVM blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.SOL,
        fromTokenAddress: "f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L",
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",

        toChainSymbol: ChainSymbol.GRL,
        toTokenAddress: "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43",
        toAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.SOLANA,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "DYUD8BuYGmtBeYbuWpEomGk9A6H2amyakSUw46vmQf8r",
        fromChainId: 5,
        fromTokenAddress: Array.from(
          bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")
        ),
        toChainId: 2,
        toTokenAddress: Array.from(
          bs58.decode("1111111111113nVbuaEbxzADW96189SLP23YyXkW")
        ),
        amount: "1330000000",
        messenger: 1,
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        fee: "20000000000000000",
        toAccountAddress: Array.from(
          bs58.decode("1111111111112TicWmEvkX7SrURa6r3JeZwDiG7n")
        ),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for SOL->TRX blockchain from SendParamsWithChainSymbols", async () => {
      const sendParams: SendParamsWithChainSymbols = {
        amount: "1.33",

        fromChainSymbol: ChainSymbol.SOL,
        fromTokenAddress: "f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L",
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",

        toChainSymbol: ChainSymbol.TRX,
        toTokenAddress: "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U",
        toAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",

        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(
        ChainType.SOLANA,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "DYUD8BuYGmtBeYbuWpEomGk9A6H2amyakSUw46vmQf8r",
        fromChainId: 5,
        fromTokenAddress: Array.from(
          bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")
        ),
        toChainId: 4,
        toTokenAddress: Array.from(
          bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")
        ),
        amount: "1330000000",
        messenger: 1,
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        fee: "20000000000000000",
        toAccountAddress: Array.from(
          bs58.decode("1111111111113Zre8c5PsFSvvA2hXgPx1hGq9YCu")
        ),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });
  });
});

function getRequestBodyMatcher(
  expectedBody: ReceiveTransactionCostRequest
): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}
