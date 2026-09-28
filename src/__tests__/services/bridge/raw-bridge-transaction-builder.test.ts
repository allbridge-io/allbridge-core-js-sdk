import { Web3 } from "web3";
import { ChainSymbol, ChainType } from "../../../chains/chain.enums";
import { Messenger, NearIntentsDepositResponse } from "../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { InvalidGasFeePaymentOptionError, SdkError } from "../../../exceptions";
import { FeePaymentMethod } from "../../../models";
import { NodeRpcUrlsConfig } from "../../../services";
import { ApproveParams, SendParams } from "../../../services/bridge/models";
import {
  DefaultRawBridgeTransactionBuilder,
  RawBridgeTransactionBuilder,
} from "../../../services/bridge/raw-bridge-transaction-builder";
import { DefaultTokenService } from "../../../services/token";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import { initChainsWithTestnet } from "../../mock/utils";

initChainsWithTestnet();

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawBridgeTransactionBuilder;
  let api: any;
  let solParams: any;
  let nodeRpcUrls: any;
  let params: any;
  const tokenService = new DefaultTokenService(api, nodeRpcUrls, params);

  beforeEach(() => {
    rawTransactionBuilder = new DefaultRawBridgeTransactionBuilder(api, nodeRpcUrls, solParams, tokenService);
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = {
      data: "0x095ea7b3000000000000000000000000ba285a8f52601eabcc769706fcbde2645aa0af18ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      from: "owner",
      to: "0xDdaC3cb57DEa3fBEFF4997d78215535Eb5787117",
      value: "0",
    };

    const approveData: ApproveParams = {
      token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      owner: "owner",
      messenger: Messenger.ALLBRIDGE,
    };
    const web3 = new Web3("http://localhost/");
    const actual = await rawTransactionBuilder.approve(web3, approveData);
    expect(actual).toEqual(expectedApproveTransaction);
  });

  describe("send with Messenger.NEAR_INTENTS", () => {
    const from = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
    const recipient = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax"; // cSpell:disable-line
    const depositAddress = "0x76b4c56085ED136a8744D52bE956396624a730E8";
    const sourceTokenAddress = "0xc7dbc4a896b34b7a10dda2ef72052145a9122f43";
    const sourceToken = {
      chainSymbol: "GRL" as ChainSymbol,
      chainType: ChainType.EVM,
      allbridgeChainId: 2,
      decimals: 6,
      tokenAddress: sourceTokenAddress,
      nearIntents: { assetId: "nep141:eth-0xc7db.omft.near" },
    } as TokenWithChainDetails;
    const destinationToken = {
      chainSymbol: ChainSymbol.TRX,
      chainType: ChainType.TRX,
      allbridgeChainId: 4,
      decimals: 6,
      tokenAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // cSpell:disable-line
      nearIntents: { assetId: "nep141:tron-d28a.omft.near" },
    } as TokenWithChainDetails;
    const depositResponse: NearIntentsDepositResponse = {
      depositAddress,
      amountIn: "1330000",
      amountOut: "1320000",
      minAmountOut: "1306800",
      deadline: "2099-01-01T00:00:00.000Z",
      timeEstimate: 20,
    };
    const erc20TransferData = new Web3().eth.abi.encodeFunctionCall(
      {
        name: "transfer",
        type: "function",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      },
      [depositAddress, "1330000"]
    );

    let nearApi: { createNearIntentsDeposit: jest.Mock };
    let builder: RawBridgeTransactionBuilder;
    let sendParams: SendParams;

    beforeEach(() => {
      nearApi = { createNearIntentsDeposit: jest.fn().mockResolvedValue(depositResponse) };
      builder = new DefaultRawBridgeTransactionBuilder(
        nearApi as unknown as AllbridgeCoreClient,
        new NodeRpcUrlsConfig({ GRL: "http://localhost/" }),
        solParams,
        tokenService
      );
      sendParams = {
        amount: "1.33",
        fromAccountAddress: from,
        toAccountAddress: recipient,
        sourceToken,
        destinationToken,
        messenger: Messenger.NEAR_INTENTS,
      };
    });

    test("creates a deposit when none is passed and transfers the tokens to it", async () => {
      const actual = await builder.send(sendParams);

      expect(nearApi.createNearIntentsDeposit).toHaveBeenCalledWith({
        sourceChainId: 2,
        sourceToken: sourceTokenAddress,
        destinationChainId: 4,
        destinationToken: destinationToken.tokenAddress,
        amount: "1330000",
        swapType: "EXACT_INPUT",
        recipient,
        refundTo: from,
      });
      expect(actual).toEqual({ from, to: sourceTokenAddress, value: "0", data: erc20TransferData });
    });

    test("reuses the passed deposit", async () => {
      const actual = await builder.send({
        ...sendParams,
        fee: "0",
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        nearIntentsDeposit: {
          depositAddress,
          amountIn: "1.33",
          amountOut: "1.32",
          minAmountOut: "1.3068",
          deadline: new Date("2099-01-01T00:00:00.000Z"),
          timeEstimate: 20,
        },
      });

      expect(nearApi.createNearIntentsDeposit).not.toHaveBeenCalled();
      expect(actual).toEqual({ from, to: sourceTokenAddress, value: "0", data: erc20TransferData });
    });

    test("builds a value transfer for a native source token", async () => {
      nearApi.createNearIntentsDeposit.mockResolvedValue({ ...depositResponse, amountIn: "1330000000000000000" });
      const actual = await builder.send({
        ...sendParams,
        sourceToken: {
          ...sourceToken,
          decimals: 18,
          tokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          isNative: true,
        },
      });

      expect(actual).toEqual({ from, to: depositAddress, value: "1330000000000000000" });
    });

    test("rejects extra gas", async () => {
      await expect(builder.send({ ...sendParams, extraGas: "1000" })).rejects.toBeInstanceOf(
        InvalidGasFeePaymentOptionError
      );
      expect(nearApi.createNearIntentsDeposit).not.toHaveBeenCalled();
    });

    test("rejects a non-zero fee", async () => {
      await expect(builder.send({ ...sendParams, fee: "20000000000000000" })).rejects.toBeInstanceOf(
        InvalidGasFeePaymentOptionError
      );
      expect(nearApi.createNearIntentsDeposit).not.toHaveBeenCalled();
    });

    test("rejects a passed deposit whose amountIn differs from the amount", async () => {
      await expect(
        builder.send({
          ...sendParams,
          nearIntentsDeposit: {
            depositAddress,
            amountIn: "2",
            amountOut: "1.99",
            minAmountOut: "1.97",
            deadline: new Date("2099-01-01T00:00:00.000Z"),
            timeEstimate: 20,
          },
        })
      ).rejects.toBeInstanceOf(SdkError);
    });

    test("rejects a deposit past its deadline", async () => {
      nearApi.createNearIntentsDeposit.mockResolvedValue({ ...depositResponse, deadline: "2000-01-01T00:00:00.000Z" });
      await expect(builder.send(sendParams)).rejects.toThrow("deadline has passed");
    });

    test("throws for a route without nearIntents", async () => {
      await expect(
        builder.send({ ...sendParams, destinationToken: { ...destinationToken, nearIntents: undefined } })
      ).rejects.toThrow("Such route does not support NEAR Intents protocol");
    });

    test("throws for a source chain without deposit transfers (STX)", async () => {
      const stxBuilder = new DefaultRawBridgeTransactionBuilder(
        nearApi as unknown as AllbridgeCoreClient,
        new NodeRpcUrlsConfig({ STX: "http://localhost/" }),
        {} as never,
        tokenService
      );
      await expect(
        stxBuilder.send({
          ...sendParams,
          sourceToken: { ...sourceToken, chainSymbol: ChainSymbol.STX, chainType: ChainType.STX },
          destinationToken: { ...destinationToken, chainSymbol: "GRL" as ChainSymbol, chainType: ChainType.EVM },
          amount: "1.33",
        })
      ).rejects.toThrow("NEAR Intents transfers from STX are not supported yet");
    });
  });
});
