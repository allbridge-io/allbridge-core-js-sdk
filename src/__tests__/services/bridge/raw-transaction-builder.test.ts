import Web3 from "web3";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { Messenger } from "../../../client/core-api/core-api.model";
import { BridgeService } from "../../../services/bridge";
import { SendParams } from "../../../services/bridge/models";
import { RawTransactionBuilder } from "../../../services/bridge/raw-transaction-builder";
import { ApproveParams } from "../../../services/token/models";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetailsTrx from "../../data/tokens-info/TokenInfoWithChainDetails-TRX.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawTransactionBuilder;
  let bridgeServiceMock: any;

  beforeEach(() => {
    const BridgeServiceMock = jest.fn();
    BridgeServiceMock.prototype.buildRawTransactionApprove = jest.fn();
    BridgeServiceMock.prototype.buildRawTransactionSend = jest.fn();
    bridgeServiceMock = new BridgeServiceMock(
      new AllbridgeCoreClientImpl({ polygonApiUrl: "", coreApiUrl: "coreApiUrl" })
    );
    rawTransactionBuilder = new RawTransactionBuilder(bridgeServiceMock as BridgeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = "expectedApproveTransaction";
    bridgeServiceMock.buildRawTransactionApprove.mockResolvedValueOnce(expectedApproveTransaction);

    const approveData: ApproveParams = {
      token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      owner: "owner",
      spender: "spender",
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.approve(web3, approveData);
    expect(actual).toEqual(expectedApproveTransaction);
    expect(bridgeServiceMock.buildRawTransactionApprove).toHaveBeenCalled();
    expect(bridgeServiceMock.buildRawTransactionApprove).toBeCalledWith(web3, approveData);
  });

  test("send should call buildRawTransactionSend", async () => {
    const expectedSendTransaction = "expectedSendTransaction";
    bridgeServiceMock.buildRawTransactionSend.mockResolvedValueOnce(expectedSendTransaction);

    const params: SendParams = {
      amount: "1.33",
      fromAccountAddress: "fromAccountAddress",
      toAccountAddress: "toAccountAddress",
      sourceToken: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      destinationToken: tokenInfoWithChainDetailsTrx[0] as TokenWithChainDetails,
      messenger: Messenger.ALLBRIDGE,
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.send(params, web3);
    expect(actual).toEqual(expectedSendTransaction);
    expect(bridgeServiceMock.buildRawTransactionSend).toHaveBeenCalled();
    expect(bridgeServiceMock.buildRawTransactionSend).toBeCalledWith(params, web3);
  });
});
