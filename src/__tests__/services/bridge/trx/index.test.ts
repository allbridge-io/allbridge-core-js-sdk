import { TronWeb } from "tronweb";
import { ChainType } from "../../../../chains/chain.enums";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { AllbridgeCoreClientWithPoolInfo } from "../../../../client/core-api/core-client-base";
import { ChainSymbol, FeePaymentMethod } from "../../../../models";
import { TokenWithChainDetails, TxSendParams } from "../../../../services/bridge/models";
import { TronBridgeService } from "../../../../services/bridge/trx";
import { formatAddress } from "../../../../services/bridge/utils";
import { mockNonceBigInt } from "../../../mock/bridge/utils";
import triggerSmartContractSendResponse from "../../../mock/tron-web/trigger-smart-contract-send.json";

describe("TrxBridge", () => {
  let trxBridge: TronBridgeService;
  let tronWebMock: any;
  let api: any;

  const nonceBigInt = mockNonceBigInt();

  beforeEach(() => {
    tronWebMock = {
      transactionBuilder: {
        triggerSmartContract: jest.fn(),
        sendTrx: jest.fn(),
      },
    };
    trxBridge = new TronBridgeService(tronWebMock as TronWeb, api as AllbridgeCoreClientWithPoolInfo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Given transfer params", () => {
    /* cSpell:disable */
    const from = "TB4K8DV1CDsuT6SGdQ2L2je4XG88KSrgRh";
    const to = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const bridgeAddress = "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM";
    const tokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U";
    const destinationTokenAddress = "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
    /* cSpell:enable */
    const amount = "1370000000000000000";
    const gasFee = "35000000";
    const destinationChainId = 2;
    const messenger = Messenger.ALLBRIDGE;

    test("buildRawTransactionSend should return RawTransaction", async () => {
      tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(triggerSmartContractSendResponse);

      const params: TxSendParams = {
        contractAddress: bridgeAddress,
        fromChainId: 2,
        fromChainSymbol: ChainSymbol.ETH,
        fromAccountAddress: from,
        fromTokenAddress: formatAddress(tokenAddress, ChainType.TRX, ChainType.TRX),
        toChainId: destinationChainId,
        toAccountAddress: formatAddress(to, ChainType.EVM, ChainType.TRX),
        toTokenAddress: formatAddress(destinationTokenAddress, ChainType.EVM, ChainType.TRX),
        amount: amount,
        messenger: messenger,
        fee: gasFee,
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
      };

      // @ts-expect-error for test purpose
      const actual = await trxBridge.buildRawTransactionSendFromParams({}, params);

      expect(actual).toEqual(triggerSmartContractSendResponse.transaction);
      expect(tronWebMock.transactionBuilder.triggerSmartContract).toHaveBeenCalledTimes(1);
      expect(tronWebMock.transactionBuilder.triggerSmartContract).toHaveBeenCalledWith(
        bridgeAddress,
        "swapAndBridge(bytes32,uint256,bytes32,uint256,bytes32,uint256,uint8,uint256)",
        { callValue: +gasFee },
        [
          {
            type: "bytes32",
            value: formatAddress(tokenAddress, ChainType.TRX, ChainType.TRX),
          },
          { type: "uint256", value: amount },
          {
            type: "bytes32",
            value: formatAddress(to, ChainType.EVM, ChainType.TRX),
          },
          { type: "uint256", value: destinationChainId },
          {
            type: "bytes32",
            value: formatAddress(destinationTokenAddress, ChainType.EVM, ChainType.TRX),
          },
          { type: "uint256", value: nonceBigInt.toString() },
          { type: "uint8", value: messenger },
          { type: "uint256", value: 0 },
        ],
        from
      );
    });
  });

  describe("Given a NEAR Intents deposit transfer", () => {
    /* cSpell:disable */
    const from = "TB4K8DV1CDsuT6SGdQ2L2je4XG88KSrgRh";
    const depositAddress = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
    const tokenAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    /* cSpell:enable */

    test("buildRawTransactionTransfer calls the TRC-20 transfer on the token contract", async () => {
      tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(triggerSmartContractSendResponse);

      const actual = await trxBridge.buildRawTransactionTransfer({
        amount: "1330000",
        token: { chainSymbol: ChainSymbol.TRX, decimals: 6, tokenAddress } as TokenWithChainDetails,
        fromAccountAddress: from,
        toAddress: depositAddress,
      });

      expect(actual).toEqual(triggerSmartContractSendResponse.transaction);
      expect(tronWebMock.transactionBuilder.sendTrx).not.toHaveBeenCalled();
      expect(tronWebMock.transactionBuilder.triggerSmartContract).toHaveBeenCalledWith(
        tokenAddress,
        "transfer(address,uint256)",
        { callValue: 0 },
        [
          { type: "address", value: depositAddress },
          { type: "uint256", value: "1330000" },
        ],
        from
      );
    });

    test("buildRawTransactionTransfer builds a TRX transfer for a native token", async () => {
      const sendTrxTransaction = { txID: "native-tx", raw_data: {} };
      tronWebMock.transactionBuilder.sendTrx.mockResolvedValueOnce(sendTrxTransaction);

      const actual = await trxBridge.buildRawTransactionTransfer({
        amount: "25000000",
        token: {
          chainSymbol: ChainSymbol.TRX,
          decimals: 6,
          tokenAddress: "TXka46PPwttNPWfFDPtt3GUodbPThyufaV", // cSpell:disable-line
          isNative: true,
        } as TokenWithChainDetails,
        fromAccountAddress: from,
        toAddress: depositAddress,
      });

      expect(actual).toBe(sendTrxTransaction);
      expect(tronWebMock.transactionBuilder.sendTrx).toHaveBeenCalledWith(depositAddress, 25000000, from);
      expect(tronWebMock.transactionBuilder.triggerSmartContract).not.toHaveBeenCalled();
    });

    test("buildRawTransactionTransfer throws when the TRC-20 call cannot be built", async () => {
      tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce({ result: { result: false } });

      await expect(
        trxBridge.buildRawTransactionTransfer({
          amount: "1",
          token: { chainSymbol: ChainSymbol.TRX, decimals: 6, tokenAddress } as TokenWithChainDetails,
          fromAccountAddress: from,
          toAddress: depositAddress,
        })
      ).rejects.toThrow("Unknown error");
    });
  });
});
