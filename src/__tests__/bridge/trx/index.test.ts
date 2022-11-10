// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ApproveData } from "../../../bridge/models";
import { MAX_AMOUNT, TronBridge } from "../../../bridge/trx";
import { formatAddress } from "../../../bridge/utils";
import * as UtilsModule from "../../../bridge/utils";
import { ChainType } from "../../../chains";
import { Messenger } from "../../../client/core-api/core-api.model";
import triggerSmartContractApproveResponse from "../../mock/tron-web/trigger-smart-contract-approve.json";
import triggerSmartContractSendResponse from "../../mock/tron-web/trigger-smart-contract-send.json";

describe("TrxBridge", () => {
  let trxBridge: TronBridge;
  let tronWebMock: any;

  const nonceSpy = vi.spyOn(UtilsModule, "getNonce");
  // prettier-ignore
  // @ts-expect-error mock nonce
  const nonceBuffer = Buffer.from(["59", "18", "4e", "21", "62", "17", "8a", "2b", "b2", "27", "1a", "97", "50", "6d", "e9", "a9", "a3", "b8", "c7", "9e", "fa", "0c", "54", "38", "9d", "97", "30", "e0", "c7", "8e", "07", "12"]);
  nonceSpy.mockImplementation(() => nonceBuffer);

  beforeEach(() => {
    tronWebMock = {
      transactionBuilder: {
        triggerSmartContract: vi.fn(),
      },
    };
    trxBridge = new TronBridge(tronWebMock as typeof TronWeb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Given transfer params", () => {
    /* cSpell:disable */
    const from = "TB4K8DV1CDsuT6SGdQ2L2je4XG88KSrgRh";
    const to = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const bridgeAddress = "TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM";
    const tokenAddress = "TS7Aqd75LprBKkPPxVLuZ8WWEyULEQFF1U";
    const destinationTokenAddress =
      "0xC7DBC4A896b34B7a10ddA2ef72052145A9122F43";
    const poolAddress = "TT3oijZeGEjKYg4UNYhaxLdh76YVyMcjHd";
    /* cSpell:enable */
    const amount = "1370000000000000000";
    const gasFee = "35000000";
    const destinationChainId = 2;
    const messenger = Messenger.ALLBRIDGE;

    test("buildRawTransactionApprove should return RawTransaction", async () => {
      tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(
        triggerSmartContractApproveResponse
      );

      const approveData: ApproveData = {
        tokenAddress: tokenAddress,
        owner: from,
        spender: poolAddress,
      };

      const actual = await trxBridge.buildRawTransactionApprove(approveData);

      expect(actual).toEqual(triggerSmartContractApproveResponse.transaction);
      expect(
        tronWebMock.transactionBuilder.triggerSmartContract
      ).toHaveBeenCalledOnce();
      expect(
        tronWebMock.transactionBuilder.triggerSmartContract
      ).toHaveBeenCalledWith(
        tokenAddress,
        "approve(address,uint256)",
        { callValue: "0" },
        [
          { type: "address", value: poolAddress },
          {
            type: "uint256",
            value: MAX_AMOUNT,
          },
        ],
        from
      );
    });

    test("buildRawTransactionSend should return RawTransaction", async () => {
      tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(
        triggerSmartContractSendResponse
      );

      const params = {
        contractAddress: bridgeAddress,
        fromTokenAddress: formatAddress(
          tokenAddress,
          ChainType.TRX,
          ChainType.TRX
        ),
        toChainId: destinationChainId,
        toTokenAddress: formatAddress(
          destinationTokenAddress,
          ChainType.EVM,
          ChainType.TRX
        ),
        amount: amount,
        messenger: messenger,
        fromAccountAddress: from,
        fee: gasFee,
        toAccountAddress: formatAddress(to, ChainType.EVM, ChainType.TRX),
      };

      const actual = await trxBridge.buildRawTransactionSend(params);

      expect(actual).toEqual(triggerSmartContractSendResponse.transaction);
      expect(
        tronWebMock.transactionBuilder.triggerSmartContract
      ).toHaveBeenCalledOnce();
      expect(
        tronWebMock.transactionBuilder.triggerSmartContract
      ).toHaveBeenCalledWith(
        bridgeAddress,
        "swapAndBridge(bytes32,uint256,bytes32,uint8,bytes32,uint256,uint8)",
        { callValue: gasFee },
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
          { type: "uint8", value: destinationChainId },
          {
            type: "bytes32",
            value: formatAddress(
              destinationTokenAddress,
              ChainType.EVM,
              ChainType.TRX
            ),
          },
          { type: "uint256", value: nonceBuffer.toJSON().data },
          { type: "uint8", value: messenger },
        ],
        from
      );
    });
  });
});
