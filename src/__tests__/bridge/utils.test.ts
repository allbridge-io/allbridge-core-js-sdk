/* cSpell:disable */

import nock, { Body, RequestBodyMatcher } from "nock";
import { describe, it, expect, beforeEach } from "vitest";
import { ChainSymbol, Messenger } from "../../../dist/src";
import { SendParamsWithChainSymbols, TxSendParams } from "../../bridge/models";
import { prepareTxSendParams } from "../../bridge/utils";
import { ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import {
  ReceiveTransactionCostRequest,
  ReceiveTransactionCostResponse,
} from "../../client/core-api/core-api.model";
import tokenInfoResponse from "../mock/core-api/token-info.json";

describe("Utils", () => {
  let api: AllbridgeCoreClient;
  let scope: nock.Scope;

  beforeEach(() => {
    api = new AllbridgeCoreClient({ apiUrl: "http://localhost" });
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
    const receiveFeeRequestTRXtoEVM: ReceiveTransactionCostRequest = {
      sourceChainId: 4,
      destinationChainId: 2,
      messenger: Messenger.ALLBRIDGE,
    };
    beforeEach(() => {
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestEVMtoTRX))
        .reply(201, receiveFeeResponse)
        .persist();
      scope = scope
        .post("/receive-fee", getRequestBodyMatcher(receiveFeeRequestTRXtoEVM))
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
        ChainType.EVM,
        sendParams,
        api
      );

      const expectedTxSendParams: TxSendParams = {
        contractAddress: "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM",
        fromTokenAddress:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        toChainId: 2,
        toTokenAddress:
          "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        amount: "1330000000000000000",
        messenger: 1,
        fromAccountAddress: "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN",
        fee: "20000000000000000",
        toAccountAddress:
          "0x00000000000000000000000068d7ed9cf9881427f1db299b90fd63ef805dd10d",
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
