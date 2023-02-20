import { abortPendingRequests, cleanAll, disableNetConnect, load } from "nock";
// @ts-expect-error import tron
import TronWeb from "tronweb";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { TronPool } from "../../../../services/liquidity-pool/trx";
import { TokenInfoWithChainDetails } from "../../../../tokens-info";

import triggerSmartContractClaimRewardsResponse from "../../../mock/tron-web/trigger-smart-contract-claim-rewards.json";
import triggerSmartContractDepositResponse from "../../../mock/tron-web/trigger-smart-contract-deposit.json";
import triggerSmartContractWithdrawResponse from "../../../mock/tron-web/trigger-smart-contract-withdraw.json";

const ACCOUNT_ADDRESS = "TSmGVvbW7jsZ26cJwfQHJWaDgCHnGax7SN";
const POOL_ADDRESS = "TT3oijZeGEjKYg4UNYhaxLdh76YVyMcjHd";
// @ts-expect-error enough
const TOKEN_INFO: TokenInfoWithChainDetails = { poolAddress: POOL_ADDRESS };
const LOCAL_NODE_URL = "https://local-test.com";

describe("TronPool", () => {
  let api: any;
  const tronWebMock = {
    transactionBuilder: {
      triggerSmartContract: vi.fn(),
    },
  };

  const tronPool = new TronPool(
    tronWebMock as typeof TronWeb,
    api as AllbridgeCoreClient
  );

  beforeAll(() => {
    disableNetConnect();
  });

  afterAll(() => {
    cleanAll();
    abortPendingRequests();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("buildRawTransactionDeposit", async () => {
    tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(
      triggerSmartContractDepositResponse
    );

    const amount = "1000000000000000000";
    const params = {
      amount: amount,
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await tronPool.buildRawTransactionDeposit(params);

    expect(rawTransaction).toEqual(
      triggerSmartContractDepositResponse.transaction
    );
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledOnce();
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledWith(
      POOL_ADDRESS,
      "deposit(uint256)",
      {
        callValue: "0",
      },
      [
        {
          type: "uint256",
          value: amount,
        },
      ],
      ACCOUNT_ADDRESS
    );
  });

  test("buildRawTransactionWithdraw", async () => {
    tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(
      triggerSmartContractWithdrawResponse
    );

    const amount = "1000";
    const params = {
      amount: amount,
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await tronPool.buildRawTransactionWithdraw(params);

    expect(rawTransaction).toEqual(
      triggerSmartContractWithdrawResponse.transaction
    );
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledOnce();
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledWith(
      POOL_ADDRESS,
      "withdraw(uint256)",
      {
        callValue: "0",
      },
      [
        {
          type: "uint256",
          value: amount,
        },
      ],
      ACCOUNT_ADDRESS
    );
  });

  test("buildRawTransactionClaimRewards", async () => {
    tronWebMock.transactionBuilder.triggerSmartContract.mockResolvedValueOnce(
      triggerSmartContractClaimRewardsResponse
    );

    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await tronPool.buildRawTransactionClaimRewards(
      params
    );

    expect(rawTransaction).toEqual(
      triggerSmartContractClaimRewardsResponse.transaction
    );
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledOnce();
    expect(
      tronWebMock.transactionBuilder.triggerSmartContract
    ).toHaveBeenCalledWith(
      POOL_ADDRESS,
      "claimRewards()",
      {
        callValue: "0",
      },
      [],
      ACCOUNT_ADDRESS
    );
  });

  describe("provide and nock full rec mock TronWeb", () => {
    test("getUserBalanceInfo", async () => {
      nockRequests("user-balance-info");

      const tronWeb = new TronWeb({ fullHost: LOCAL_NODE_URL });

      const tronPool = new TronPool(tronWeb, api as AllbridgeCoreClient);

      const userBalanceInfo = await tronPool.getUserBalanceInfo(
        ACCOUNT_ADDRESS,
        TOKEN_INFO
      );

      expect(userBalanceInfo).toEqual({
        lpAmount: "1790",
        rewardDebt: "6562954865251962",
      });
      expect(userBalanceInfo.userLiquidity).toEqual(`1.79`);
    });
  });
});

function nockRequests(recName: string) {
  load(
    `./src/__tests__/services/liquidity-pool/trx/data/nock/${recName}-rec.json`
  );
}
