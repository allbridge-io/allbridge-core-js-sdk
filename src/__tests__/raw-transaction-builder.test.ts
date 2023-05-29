import Web3 from "web3";
import { AllbridgeCoreClientImpl } from "../client/core-api";
import { Messenger, SendParamsWithTokenInfos, TokenInfoWithChainDetails} from "../index";
import { RawTransactionBuilder } from "../raw-transaction-builder";
import { BridgeService } from "../services/bridge";
import { ApproveDataWithTokenInfo } from "../services/bridge/models";
import { LiquidityPoolService } from "../services/liquidity-pool";
import tokenInfoWithChainDetailsGrl from "./data/tokens-info/TokenInfoWithChainDetails-GRL.json";
import tokenInfoWithChainDetailsTrx from "./data/tokens-info/TokenInfoWithChainDetails-TRX.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawTransactionBuilder;
  let bridgeServiceMock: any;
  let liquidityPoolService: any;

  beforeEach(() => {
    const BridgeServiceMock = jest.fn();
    BridgeServiceMock.prototype.buildRawTransactionApprove = jest.fn();
    BridgeServiceMock.prototype.buildRawTransactionSend = jest.fn();
    bridgeServiceMock = new BridgeServiceMock(new AllbridgeCoreClientImpl({polygonApiUrl: "", coreApiUrl: "coreApiUrl" }));
    rawTransactionBuilder = new RawTransactionBuilder(
      bridgeServiceMock as BridgeService,
      liquidityPoolService as LiquidityPoolService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = "expectedApproveTransaction";
    bridgeServiceMock.buildRawTransactionApprove.mockResolvedValueOnce(expectedApproveTransaction);

    const approveData: ApproveDataWithTokenInfo = {
      token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenInfoWithChainDetails,
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

    const params: SendParamsWithTokenInfos =
    {
      amount: "1.33",
      fromAccountAddress: "fromAccountAddress",
      toAccountAddress: "toAccountAddress",
      sourceChainToken: tokenInfoWithChainDetailsGrl[0] as unknown as TokenInfoWithChainDetails,
      destinationChainToken: tokenInfoWithChainDetailsTrx[0] as TokenInfoWithChainDetails,
      messenger: Messenger.ALLBRIDGE,
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.send(params, web3);
    expect(actual).toEqual(expectedSendTransaction);
    expect(bridgeServiceMock.buildRawTransactionSend).toHaveBeenCalled();
    expect(bridgeServiceMock.buildRawTransactionSend).toBeCalledWith(params, web3);
  });
});
