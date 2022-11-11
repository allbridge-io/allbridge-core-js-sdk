import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Web3 from "web3";
import { BridgeService } from "../bridge";
import { AllbridgeCoreClientImpl } from "../client/core-api";
import {
  ApproveData,
  ChainSymbol,
  Messenger,
  SendParamsWithChainSymbols,
} from "../index";

import { RawTransactionBuilder } from "../raw-transaction-builder";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawTransactionBuilder;
  let bridgeServiceMock: any;

  beforeEach(() => {
    const BridgeServiceMock = vi.fn();
    BridgeServiceMock.prototype.buildRawTransactionApprove = vi.fn();
    BridgeServiceMock.prototype.buildRawTransactionSend = vi.fn();
    bridgeServiceMock = new BridgeServiceMock(
      new AllbridgeCoreClientImpl({ apiUrl: "apiUrl" })
    );
    rawTransactionBuilder = new RawTransactionBuilder(
      bridgeServiceMock as BridgeService
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = "expectedApproveTransaction";
    bridgeServiceMock.buildRawTransactionApprove.mockResolvedValueOnce(
      expectedApproveTransaction
    );

    const approveData: ApproveData = {
      tokenAddress: "tokenAddress",
      owner: "owner",
      spender: "spender",
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.approve(web3, approveData);
    expect(actual).toEqual(expectedApproveTransaction);
    expect(bridgeServiceMock.buildRawTransactionApprove).toHaveBeenCalled();
    expect(bridgeServiceMock.buildRawTransactionApprove).toBeCalledWith(
      web3,
      approveData
    );
  });

  test("send should call buildRawTransactionSend", async () => {
    const expectedSendTransaction = "expectedSendTransaction";
    bridgeServiceMock.buildRawTransactionSend.mockResolvedValueOnce(
      expectedSendTransaction
    );

    const params: SendParamsWithChainSymbols = {
      fromChainSymbol: ChainSymbol.GRL,
      fromTokenAddress: "fromTokenAddress",
      toChainSymbol: ChainSymbol.TRX,
      toTokenAddress: "toTokenAddress",
      amount: "1.33",
      fromAccountAddress: "fromAccountAddress",
      toAccountAddress: "toAccountAddress",
      messenger: Messenger.ALLBRIDGE,
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.send(web3, params);
    expect(actual).toEqual(expectedSendTransaction);
    expect(bridgeServiceMock.buildRawTransactionSend).toHaveBeenCalled();
    expect(bridgeServiceMock.buildRawTransactionSend).toBeCalledWith(
      web3,
      params
    );
  });
});
