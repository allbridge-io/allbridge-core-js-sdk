import Web3 from "web3";
import { TestnetChainSymbol } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { FeePaymentMethod } from "../../../../models";
import { EvmBridgeService } from "../../../../services/bridge/evm";
import { TxSendParams } from "../../../../services/bridge/models";
import { ChainDetailsMap } from "../../../../tokens-info";
import tokensGroupedByChain from "../../../data/tokens-info/ChainDetailsMap-ETH-USDT.json";
import { mockNonce } from "../../../mock/bridge/utils";

describe("EvmBridge", () => {
  let evmBridge: EvmBridgeService;

  const chainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMap;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error enough for mock
  const api: AllbridgeCoreClient = {
    getChainDetailsMap: () =>
      new Promise((resolve) => {
        resolve(chainDetailsMap);
      }),
  };

  beforeEach(() => {
    evmBridge = new EvmBridgeService(new Web3(), api);
  });

  describe("Given transfer params", () => {
    const from = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const bridgeAddress = "0xba285A8F52601EabCc769706FcBDe2645aa0AF18";
    const gasFee = "20000000000000000";

    test("buildRawTransactionSend should return RawTransaction", async () => {
      mockNonce();

      const params: TxSendParams = {
        amount: "1330000000000000000",
        contractAddress: "0xba285A8F52601EabCc769706FcBDe2645aa0AF18",
        fromChainId: 2,
        fromChainSymbol: TestnetChainSymbol.GRL,
        fromAccountAddress: from,
        fromTokenAddress: "0x000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f43",
        toChainId: 4,
        toAccountAddress: bridgeAddress,
        toTokenAddress: "0x000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b",
        messenger: Messenger.ALLBRIDGE,
        fee: gasFee,
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
      };

      const actual = await evmBridge.buildRawTransactionSendFromParams(params);
      expect(actual).toEqual({
        from: from,
        to: bridgeAddress,
        value: gasFee,
        data: "0x4cd480bd000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f4300000000000000000000000000000000000000000000000012751bf40f450000ba285a8f52601eabcc769706fcbde2645aa0af180000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b3b1200153e110000001b006132000000000000000000362600611e000000070c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
      });
    });
  });
});
