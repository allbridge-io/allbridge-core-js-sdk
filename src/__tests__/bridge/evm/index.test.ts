import { beforeEach, describe, expect, test } from "vitest";

import Web3 from "web3";
import { EvmBridge } from "../../../bridge/evm";
import { ApproveData, TxSendParams } from "../../../bridge/models";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import { mockNonce } from "../../mock/bridge/utils";

describe("EvmBridge", () => {
  let evmBridge: EvmBridge;
  let api: any;

  beforeEach(() => {
    evmBridge = new EvmBridge(new Web3(), api as AllbridgeCoreClient);
  });

  describe("Given transfer params", () => {
    const from = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const bridgeAddress = "0xba285A8F52601EabCc769706FcBDe2645aa0AF18";
    const tokenAddress = "0xDdaC3cb57DEa3fBEFF4997d78215535Eb5787117";
    const poolAddress = "0xEc46d2b11e68A31026673D63B345B889AB37C0Bc";
    const gasFee = "20000000000000000";

    test("buildRawTransactionApprove should return RawTransaction", async () => {
      const approveData: ApproveData = {
        tokenAddress: tokenAddress,
        owner: from,
        spender: poolAddress,
      };

      const actual = await evmBridge.buildRawTransactionApprove(approveData);

      expect(actual).toEqual({
        from: from,
        to: tokenAddress,
        value: "0",
        data: "0x095ea7b3000000000000000000000000ec46d2b11e68a31026673d63b345b889ab37c0bcffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        type: 2,
      });
    });

    test("buildRawTransactionSend should return RawTransaction", () => {
      mockNonce();

      const params: TxSendParams = {
        amount: "1330000000000000000",
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromAccountAddress: from,
        fromTokenAddress:
          "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        toChainId: 4,
        toAccountAddress: bridgeAddress,
        toTokenAddress:
          "0x000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b",
        messenger: Messenger.ALLBRIDGE,
        fee: gasFee,
      };

      const actual = evmBridge.buildRawTransactionSendFromParams(params);
      expect(actual).toEqual({
        from: from,
        to: bridgeAddress,
        value: gasFee,
        data: "0xf35e37d3000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f4300000000000000000000000000000000000000000000000012751bf40f450000ba285a8f52601eabcc769706fcbde2645aa0af180000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b3b1200153e110000001b006132000000000000000000362600611e000000070c0000000000000000000000000000000000000000000000000000000000000001",
        type: 2,
      });
    });
  });
});
