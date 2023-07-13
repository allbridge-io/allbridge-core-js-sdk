import Web3 from "web3";
import { RawTransactionBuilder } from "../../../services/liquidity-pool/raw-transaction-builder";
import { TokenService } from "../../../services/token";
import { ApproveParams } from "../../../services/token/models";
import { TokenWithChainDetails } from "../../../tokens-info";
import tokenInfoWithChainDetailsGrl from "../../data/tokens-info/TokenInfoWithChainDetails-GRL.json";

describe("RawTransactionBuilder", () => {
  let rawTransactionBuilder: RawTransactionBuilder;
  let liquidityPoolService: any;
  let api: any;
  let solParams: any;
  let tronRpcUrl: any;
  const tokenService = new TokenService(api, solParams);

  beforeEach(() => {
    rawTransactionBuilder = new RawTransactionBuilder(api, solParams, tronRpcUrl, liquidityPoolService, tokenService);
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
