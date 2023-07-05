import Web3 from "web3";
import { AllbridgeCoreClientImpl } from "../../../client/core-api";
import { LiquidityPoolService } from "../../../services/liquidity-pool";
import { RawTransactionBuilder } from "../../../services/liquidity-pool/raw-transaction-builder";
import { ApproveParams } from "../../../services/token/models";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawTransactionBuilder;
  let liquidityPoolServiceMock: any;

  beforeEach(() => {
    const LiquidityPoolServiceMock = jest.fn();
    liquidityPoolServiceMock.prototype.buildRawTransactionApprove = jest.fn();
    liquidityPoolServiceMock.prototype.buildRawTransactionSend = jest.fn();
    liquidityPoolServiceMock = new LiquidityPoolServiceMock(
      new AllbridgeCoreClientImpl({ polygonApiUrl: "", coreApiUrl: "coreApiUrl" })
    );
    rawTransactionBuilder = new RawTransactionBuilder(liquidityPoolServiceMock as LiquidityPoolService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = "expectedApproveTransaction";
    liquidityPoolServiceMock.buildRawTransactionApprove.mockResolvedValueOnce(expectedApproveTransaction);

    const approveData: ApproveParams = {
      token: tokenInfoWithChainDetailsGrl[0] as unknown as TokenWithChainDetails,
      owner: "owner",
      spender: "spender",
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.approve(web3, approveData);
    expect(actual).toEqual(expectedApproveTransaction);
    expect(liquidityPoolServiceMock.buildRawTransactionApprove).toHaveBeenCalled();
    expect(liquidityPoolServiceMock.buildRawTransactionApprove).toBeCalledWith(web3, approveData);
  });
});
