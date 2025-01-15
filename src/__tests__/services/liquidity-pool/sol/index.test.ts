import * as nock from "nock";
import { AllbridgeCoreClientWithPoolInfo } from "../../../../client/core-api/core-client-base";
import { SolanaPoolService } from "../../../../services/liquidity-pool/sol";
import { RawTransaction } from "../../../../services/models";
import { TokenWithChainDetails } from "../../../../tokens-info";
import { CLAIM_REWARDS_RAW_TX, DEPOSIT_RAW_TX, WITHDRAW_RAW_TX } from "./data/expected";

const ACCOUNT_ADDRESS = "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr";
const POOL_ADDRESS = "6jD785bW6HSNrNCSx12HjL837Gf1vpgqC4zeb95DYNTZ";
const BRIDGE_ADDRESS = "EmLt85sXNvqjzZo3C6BCq55ZzSuvSNFomVnf6b1PgY8R";
// @ts-expect-error enough
const TOKEN_INFO: TokenWithChainDetails = {
  poolAddress: POOL_ADDRESS,
  bridgeAddress: BRIDGE_ADDRESS,
};

describe.skip("SolanaPool", () => {
  let api: any;
  const solanaRpcUrl = "https://api.devnet.solana.com";

  const solanaPool = new SolanaPoolService(solanaRpcUrl, api as AllbridgeCoreClientWithPoolInfo);

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  test("buildRawTransactionDeposit", async () => {
    nockRequests("deposit");

    const amount = "300000000";
    const params = {
      amount: amount,
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await solanaPool.buildRawTransactionDeposit(params);

    equalsExceptRecentBlockHash(rawTransaction, DEPOSIT_RAW_TX);
  });

  test("buildRawTransactionWithdraw", async () => {
    nockRequests("withdraw");

    const amount = "300";
    const params = {
      amount: amount,
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await solanaPool.buildRawTransactionWithdraw(params);

    equalsExceptRecentBlockHash(rawTransaction, WITHDRAW_RAW_TX);
  });

  test("buildRawTransactionClaimRewards", async () => {
    nockRequests("claim-rewards");

    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await solanaPool.buildRawTransactionClaimRewards(params);

    equalsExceptRecentBlockHash(rawTransaction, CLAIM_REWARDS_RAW_TX);
  });

  test("getUserBalanceInfo", async () => {
    nockRequests("user-balance-info");

    const userBalanceInfo = await solanaPool.getUserBalanceInfo(ACCOUNT_ADDRESS, TOKEN_INFO);

    expect(userBalanceInfo).toEqual({
      lpAmount: "0",
      rewardDebt: "0",
    });
  });
});

function equalsExceptRecentBlockHash(actualRawTx: RawTransaction, expectedRawTx: string) {
  const actual = JSON.parse(JSON.stringify(actualRawTx, null, 2));
  const expected = JSON.parse(expectedRawTx);
  expected.recentBlockhash = actual?.recentBlockhash;
  expect(actual).toEqual(expected);
}

function nockRequests(recName: string) {
  const nocks = nock.load(`./src/__tests__/services/liquidity-pool/sol/data/nock/${recName}-rec.json`);
  nocks.forEach(function (nock) {
    nock.filteringRequestBody((b) => {
      try {
        const body = JSON.parse(b);
        body.id = "33350381-1589-416f-b02d-b6e0d850ea2b";
        return JSON.stringify(body);
      } catch (ignoreError) {
        return b;
      }
    });
  });
}
