import { Web3 } from "web3";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { AllbridgeCoreClientWithPoolInfo } from "../../../../client/core-api/core-client-base";
import { ChainSymbol, ChainType, FeePaymentMethod, SendParams, TokenWithChainDetails } from "../../../../models";
import { NodeRpcUrlsConfig } from "../../../../services";
import { encodeCctpHookForStellar } from "../../../../services/bridge/cctp-utils";
import { EvmBridgeService } from "../../../../services/bridge/evm";
import { formatAddress } from "../../../../services/bridge/utils";
import CctpBridge from "../../../../services/models/abi/CctpBridge";
import { ChainDetailsMapWithFlags } from "../../../../tokens-info";
import tokensGroupedByChain from "../../../data/tokens-info/ChainDetailsMap-ETH-USDT.json";
import { mockNonce } from "../../../mock/bridge/utils";
import { initChainsWithTestnet } from "../../../mock/utils";

initChainsWithTestnet();

describe("EvmBridge", () => {
  let evmBridge: EvmBridgeService;

  const chainDetailsMap = tokensGroupedByChain as unknown as ChainDetailsMapWithFlags;

  // @ts-expect-error enough for mock
  const api: AllbridgeCoreClientWithPoolInfo = {
    getChainDetailsMap: () =>
      new Promise((resolve) => {
        resolve(chainDetailsMap);
      }),
    getReceiveTransactionCost: () => Promise.resolve({ abrExchangeRate: "1" } as any),
  };

  beforeEach(() => {
    evmBridge = new EvmBridgeService(new Web3("http://localhost/"), api, new NodeRpcUrlsConfig({}));
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
          chainSymbol: "GRL" as ChainSymbol,
          decimals: 18,
          tokenAddress: "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43",
        } as TokenWithChainDetails,
        fromAccountAddress: from,
        destinationToken: {
          allbridgeChainId: 4,
          chainSymbol: "GRL" as ChainSymbol,
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

  describe("Given a CCTPv2 transfer from EVM to Stellar", () => {
    const from = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const sourceBridge = "0xba285A8F52601EabCc769706FcBDe2645aa0AF18";
    /* cSpell:disable */
    const destinationBridge = "CAYUCAP2ORC5PSASKC63MQGMB6X62YXDADCSPDBZNHHHG33GKNZUYROB";
    const recipient = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
    /* cSpell:enable */

    const params: SendParams = {
      amount: "1.33",
      sourceToken: {
        allbridgeChainId: 2,
        chainSymbol: ChainSymbol.SPL,
        chainType: ChainType.EVM,
        cctpV2Address: sourceBridge,
        decimals: 6,
        tokenAddress: "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43",
      } as TokenWithChainDetails,
      fromAccountAddress: from,
      destinationToken: {
        allbridgeChainId: 7,
        chainSymbol: ChainSymbol.SRB,
        chainType: ChainType.SRB,
        cctpV2Address: destinationBridge,
        decimals: 6,
        tokenAddress: destinationBridge,
      } as TokenWithChainDetails,
      toAccountAddress: recipient,
      messenger: Messenger.CCTP_V2,
      fee: "20000000000000000",
      gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
    };

    test("builds bridgeWithHook with the Stellar bridge as mint recipient", async () => {
      const cctpBridge = new new Web3().eth.Contract(CctpBridge.abi, sourceBridge);
      const expectedRecipient = formatAddress(destinationBridge, ChainType.SRB, ChainType.EVM);
      const bridgeWithHook = jest.fn(cctpBridge.methods.bridgeWithHook);
      const otherBridges = jest
        .fn()
        .mockReturnValue({ call: jest.fn().mockResolvedValue(`0x${expectedRecipient.slice(2).toUpperCase()}`) });
      jest.spyOn(EvmBridgeService.prototype as any, "getCctpBridgeContract").mockReturnValue({
        methods: { ...cctpBridge.methods, bridgeWithHook, otherBridges },
      });

      const actual = await evmBridge.buildRawTransactionSend(params);
      const expectedData = new Web3().eth.abi.encodeFunctionCall(
        {
          name: "bridgeWithHook",
          type: "function",
          inputs: [
            { name: "amount", type: "uint256" },
            { name: "mintRecipient", type: "bytes32" },
            { name: "destinationChainId", type: "uint256" },
            { name: "relayerFeeTokenAmount", type: "uint256" },
            { name: "hookData", type: "bytes" },
          ],
        },
        [
          "1330000",
          formatAddress(destinationBridge, ChainType.SRB, ChainType.EVM),
          "7",
          "0",
          "0x" + encodeCctpHookForStellar(recipient).toString("hex"),
        ]
      );

      expect(actual).toEqual({
        from,
        to: sourceBridge,
        value: "20000000000000000",
        data: expectedData,
      });
    });

    test("rejects when the configured Stellar destination caller differs from the bridge", async () => {
      const expected = formatAddress(destinationBridge, ChainType.SRB, ChainType.EVM);
      const configured = "0x0000000000000000000000000000000000000000000000000000000000000001";
      const bridgeWithHook = jest.fn();
      const otherBridges = jest.fn().mockReturnValue({ call: jest.fn().mockResolvedValue(configured) });
      jest.spyOn(EvmBridgeService.prototype as any, "getCctpBridgeContract").mockReturnValue({
        methods: { bridgeWithHook, otherBridges },
      });

      await expect(evmBridge.buildRawTransactionSend(params)).rejects.toThrow(
        `CCTPv2 destination caller mismatch: expected ${expected}, received ${configured}`
      );
      expect(otherBridges).toHaveBeenCalledWith(7);
      expect(bridgeWithHook).not.toHaveBeenCalled();
    });
  });
});
