// @ts-expect-error import tron
import * as TronWeb from "tronweb";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { TronPool } from "../../../../services/liquidity-pool/trx";
import { TokenInfoWithChainDetails } from "../../../../tokens-info";

import triggerSmartContractClaimRewardsResponse from "../../../mock/tron-web/trigger-smart-contract-claim-rewards.json";
import triggerSmartContractDepositResponse from "../../../mock/tron-web/trigger-smart-contract-deposit.json";
import triggerSmartContractWithdrawResponse from "../../../mock/tron-web/trigger-smart-contract-withdraw.json";

const ACCOUNT_ADDRESS = "0x5777777cf9881427F1dB299B90Fd63ef805dd10d";
const POOL_ADDRESS = "0x727e10f9E750C922bf9dee7620B58033F566b34F";
// @ts-expect-error enough
const TOKEN_INFO: TokenInfoWithChainDetails = { poolAddress: POOL_ADDRESS };

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
});
