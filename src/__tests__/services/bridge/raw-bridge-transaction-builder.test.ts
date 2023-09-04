import Web3 from "web3";
import {
  DefaultRawBridgeTransactionBuilder,
  RawBridgeTransactionBuilder,
} from "../../../services/bridge/raw-bridge-transaction-builder";
import { DefaultTokenService } from "../../../services/token";
import { ApproveParams } from "../../../services/token/models";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawBridgeTransactionBuilder;
  let bridgeService: any;
  let api: any;
  let solParams: any;
  const tokenService = new DefaultTokenService(api, solParams);

  beforeEach(() => {
    rawTransactionBuilder = new DefaultRawBridgeTransactionBuilder(api, solParams, bridgeService, tokenService);
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
      spender: "spender",
    };
    const web3 = new Web3();
    const actual = await rawTransactionBuilder.approve(web3, approveData);
    expect(actual).toEqual(expectedApproveTransaction);
  });
});
