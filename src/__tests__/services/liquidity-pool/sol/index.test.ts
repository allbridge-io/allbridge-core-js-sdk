import * as nock from "nock";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { SolanaPoolParams, SolanaPool } from "../../../../services/liquidity-pool/sol";
import { TokenWithChainDetails } from "../../../../tokens-info";
import { CLAIM_REWARDS_RAW_TX, DEPOSIT_RAW_TX, WITHDRAW_RAW_TX } from "./data/expected";

const ACCOUNT_ADDRESS = "6wK6rSmbh65JqY9gputbRBhfZXWkGqvgoQ889y1Qqefr";
const POOL_ADDRESS = "6J9DNoMFciheb28kRbrtHjuKUgrfcAeq6AbSKNAJZJpE";
const BRIDGE_ADDRESS = "DYUD8BuYGmtBeYbuWpEomGk9A6H2amyakSUw46vmQf8r";
// @ts-expect-error enough
const TOKEN_INFO: TokenWithChainDetails = {
  poolAddress: POOL_ADDRESS,
  bridgeAddress: BRIDGE_ADDRESS,
};

describe("SolanaPool", () => {
  let api: any;
  const solParams: SolanaPoolParams = {
    solanaRpcUrl: "https://api.devnet.solana.com",
  };

  const solanaPool = new SolanaPool(solParams, api as AllbridgeCoreClient);

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

    expect(JSON.stringify(rawTransaction, null, 2)).toEqual(DEPOSIT_RAW_TX);
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

    expect(JSON.stringify(rawTransaction, null, 2)).toEqual(WITHDRAW_RAW_TX);
  });

  test("buildRawTransactionClaimRewards", async () => {
    nockRequests("claim-rewards");

    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await solanaPool.buildRawTransactionClaimRewards(params);

    expect(JSON.stringify(rawTransaction, null, 2)).toEqual(CLAIM_REWARDS_RAW_TX);
  });

  test("getUserBalanceInfo", async () => {
    nockRequests("user-balance-info");

    const userBalanceInfo = await solanaPool.getUserBalanceInfo(ACCOUNT_ADDRESS, TOKEN_INFO);

    expect(userBalanceInfo).toEqual({
      lpAmount: "7285",
      rewardDebt: "5518259",
    });
    expect(userBalanceInfo.userLiquidity).toEqual(`7.285`);
  });
});

function nockRequests(recName: string) {
  const nocks = nock.load(`./src/__tests__/services/liquidity-pool/sol/data/nock/${recName}-rec.json`);
  nocks.forEach(function (nock) {
    nock.filteringRequestBody((b) => {
      try {
        const body = JSON.parse(b);
        body.id = "33350381-1589-416f-b02d-b6e0d850ea2b";
        return JSON.stringify(body);
      } catch (e) {
        return b;
      }
    });
  });
}
