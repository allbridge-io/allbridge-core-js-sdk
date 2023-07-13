/* cSpell:disable */

import bs58 from "bs58";
import nock, { Body, RequestBodyMatcher } from "nock";
import { ChainSymbol, ChainType } from "../../../chains";
import { AllbridgeCoreClient, AllbridgeCoreClientImpl } from "../../../client/core-api";
import { ApiClientImpl } from "../../../client/core-api/api-client";
import {
  Messenger,
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../../../client/core-api/core-api.model";
import { FeePaymentMethod, SendParams, TokenWithChainDetails } from "../../../models";
import { TxSendParams } from "../../../services/bridge/models";
import { prepareTxSendParams } from "../../../services/bridge/utils";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetailsSol from "../../data/tokens-info/TokenInfoWithChainDetails-SOL.json";
import tokenInfoWithChainDetailsTrx from "../../data/tokens-info/TokenInfoWithChainDetails-TRX.json";
import tokenInfoResponse from "../../mock/core-api/token-info.json";

describe("ChainBridgeService Utils", () => {
  let api: AllbridgeCoreClient;
  let scope: nock.Scope;

  beforeEach(() => {
    api = new AllbridgeCoreClientImpl(
      new ApiClientImpl({ coreApiUrl: "http://localhost", polygonApiUrl: "http://localhost" })
    );
    scope = nock("http://localhost").get("/token-info").reply(200, tokenInfoResponse).persist();
  });

  describe("prepareTxSendParams()", () => {
    const fee = "20000000000000000";
    const receiveFeeResponse: ReceiveTransactionCostResponse = { fee };

    it("should return prepared TxSendParams for EVM->TRX blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestEVMtoTRX: ReceiveTransactionCostRequest = {
        sourceChainId: 2,
        destinationChainId: 4,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestEVMtoTRX))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        toAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        sourceToken: tokenInfoWithChainDetailsGrl[1] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsTrx[0] as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.EVM, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromChainSymbol: ChainSymbol.GRL,
        fromTokenAddress: "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        toChainId: 4,
        toTokenAddress: "0x000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b",
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: fee,
        toAccountAddress: "0x000000000000000000000000b83811067ab3a275ece28d3f8ec6875105ef9bae",
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for EVM->SOL blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestEVMtoSOL: ReceiveTransactionCostRequest = {
        sourceChainId: 2,
        destinationChainId: 5,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestEVMtoSOL))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        toAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        sourceToken: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsSol[0] as unknown as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.EVM, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromChainSymbol: ChainSymbol.GRL,
        fromTokenAddress: "0x000000000000000000000000ddac3cb57dea3fbeff4997d78215535eb5787117",
        toChainId: 5,
        toTokenAddress: "0x09c0917b1690e4929808fbc5378d9619a1ff49b3aaff441b2fa4bd58ab035a33",
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: "20000000000000000",
        toAccountAddress: "0x583443dc4d82f958bdfce83c26d5ee2968af51d6f249e5181b2300c625a8cdf1",
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for TRX->EVM blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestTRXtoEVM: ReceiveTransactionCostRequest = {
        sourceChainId: 4,
        destinationChainId: 2,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestTRXtoEVM))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        toAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        sourceToken: tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsGrl[1] as unknown as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.TRX, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
        fromChainId: 4,
        fromChainSymbol: ChainSymbol.TRX,
        fromTokenAddress: Array.from(bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")),
        toChainId: 2,
        toTokenAddress: Array.from(bs58.decode("1111111111113nVbuaEbxzADW96189SLP23YyXkW")),
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: "20000000000000000",
        toAccountAddress: Array.from(bs58.decode("1111111111112TicWmEvkX7SrURa6r3JeZwDiG7n")),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for TRX->SOL blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestTRXtoSOL: ReceiveTransactionCostRequest = {
        sourceChainId: 4,
        destinationChainId: 5,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestTRXtoSOL))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        toAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        sourceToken: tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsSol[0] as unknown as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.TRX, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
        fromChainId: 4,
        fromChainSymbol: ChainSymbol.TRX,
        fromTokenAddress: Array.from(bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")),
        toChainId: 5,
        toTokenAddress: Array.from(bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")),
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: "20000000000000000",
        toAccountAddress: Array.from(bs58.decode("6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr")),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for SOL->EVM blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestSOLtoEVM: ReceiveTransactionCostRequest = {
        sourceChainId: 5,
        destinationChainId: 2,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestSOLtoEVM))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        toAccountAddress: "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d",
        sourceToken: tokenInfoWithChainDetailsSol[0] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsGrl[1] as unknown as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.SOLANA, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "DYUD8BuYGmtBeYbuWpEomGk9A6H2amyakSUw46vmQf8r",
        fromChainId: 5,
        fromChainSymbol: ChainSymbol.SOL,
        fromTokenAddress: Array.from(bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")),
        toChainId: 2,
        toTokenAddress: Array.from(bs58.decode("1111111111113nVbuaEbxzADW96189SLP23YyXkW")),
        amount: "1330000000",
        messenger: 1,
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: "20000000000000000",
        toAccountAddress: Array.from(bs58.decode("1111111111112TicWmEvkX7SrURa6r3JeZwDiG7n")),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });

    it("should return prepared TxSendParams for SOL->TRX blockchain from SendParamsWithChainSymbols", async () => {
      const receiveFeeRequestSOLtoTRX: ReceiveTransactionCostRequest = {
        sourceChainId: 5,
        destinationChainId: 4,
        messenger: Messenger.ALLBRIDGE,
      };

      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestSOLtoTRX))
        .reply(201, receiveFeeResponse)
        .persist();

      const sendParams: SendParams = {
        amount: "1.33",
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        toAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        sourceToken: tokenInfoWithChainDetailsSol[0] as unknown as TokenWithChainDetails,
        destinationToken: tokenInfoWithChainDetailsTrx[0] as unknown as TokenWithChainDetails,
        messenger: Messenger.ALLBRIDGE,
      };

      const txSendParams = await prepareTxSendParams(ChainType.SOLANA, sendParams, api);

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "DYUD8BuYGmtBeYbuWpEomGk9A6H2amyakSUw46vmQf8r",
        fromChainId: 5,
        fromChainSymbol: ChainSymbol.SOL,
        fromTokenAddress: Array.from(bs58.decode("f4yhod6Y7jzVwFfy3iHDg49GAerFTrtp1Ac1ubdWx7L")),
        toChainId: 4,
        toTokenAddress: Array.from(bs58.decode("1111111111113U2xgKF5ainKTp7PfqaoUTGW3rki")),
        amount: "1330000000",
        messenger: 1,
        fromAccountAddress: "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        fee: "20000000000000000",
        toAccountAddress: Array.from(bs58.decode("1111111111113Zre8c5PsFSvvA2hXgPx1hGq9YCu")),
      };
      expect(txSendParams).toEqual(expectedTxSendParams);
    });
  });
});

function getRequestBodyMatcher(expectedBody: ReceiveTransactionCostRequest): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}
