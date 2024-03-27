import Web3 from "web3";
import { ChainSymbol } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { FeePaymentMethod, SendParams, TokenWithChainDetails } from "../../../../models";
import { NodeRpcUrlsConfig } from "../../../../services";
import { EvmBridgeService } from "../../../../services/bridge/evm";
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
    evmBridge = new EvmBridgeService(new Web3(), api, new NodeRpcUrlsConfig({}));
  });

  describe("Given transfer params", () => {
    const from = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const bridgeAddress = "0xba285A8F52601EabCc769706FcBDe2645aa0AF18";
    const gasFee = "20000000000000000";

    test("buildRawTransactionSend should return RawTransaction", async () => {
      mockNonce();

      const params: SendParams = {
        amount: "1.33",
        sourceToken: {
          bridgeAddress: bridgeAddress,
          allbridgeChainId: 2,
          chainSymbol: ChainSymbol.GRL,
          decimals: 18,
          tokenAddress: "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43",
        } as TokenWithChainDetails,
        fromAccountAddress: from,
        destinationToken: {
          allbridgeChainId: 4,
          chainSymbol: ChainSymbol.GRL,
          decimals: 18,
          tokenAddress: "0xb10388f04f8331b59a02732cc1b6ac0d7045574b",
        } as TokenWithChainDetails,
        toAccountAddress: bridgeAddress,
        messenger: Messenger.ALLBRIDGE,
        fee: gasFee,
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
      };

      const actual = await evmBridge.buildRawTransactionSend(params);
      expect(actual).toEqual({
        from: from,
        to: bridgeAddress,
        value: gasFee,
        data: "0x4cd480bd000000000000000000000000c7dbc4a896b34b7a10dda2ef72052145a9122f4300000000000000000000000000000000000000000000000012751bf40f450000000000000000000000000000ba285a8f52601eabcc769706fcbde2645aa0af180000000000000000000000000000000000000000000000000000000000000004000000000000000000000000b10388f04f8331b59a02732cc1b6ac0d7045574b3b1200153e110000001b006132000000000000000000362600611e000000070c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
      });
    });
  });
});
