import Web3 from "web3";
import {
  DefaultRawPoolTransactionBuilder,
  RawPoolTransactionBuilder,
} from "../../../services/liquidity-pool/raw-pool-transaction-builder";
import { DefaultTokenService } from "../../../services/token";
import { ApproveParams } from "../../../services/token/models";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawPoolTransactionBuilder;
  let api: any;
  let nodeRpcUrls: any;
  let params: any;
  const tokenService = new DefaultTokenService(api, nodeRpcUrls, params);

  beforeEach(() => {
    rawTransactionBuilder = new DefaultRawPoolTransactionBuilder(api, nodeRpcUrls, params, tokenService);
  });

  test("approve should call buildRawTransactionApprove", async () => {
    const expectedApproveTransaction = {
      data: "0x095ea7b3000000000000000000000000ec46d2b11e68a31026673d63b345b889ab37c0bcffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
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
