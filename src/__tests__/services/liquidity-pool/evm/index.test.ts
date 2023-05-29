import nock, { abortPendingRequests, cleanAll, disableNetConnect } from "nock";
import Web3 from "web3";
import { ChainSymbol } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { EvmPool } from "../../../../services/liquidity-pool/evm";
import { TokenInfoWithChainDetails } from "../../../../tokens-info";
import { rpcReply } from "../../../mock/utils";

const POLYGON_GAS_PRICE = "1433333332";
const POLYGON_MAX_PRICE = "1433333348";
const ACCOUNT_ADDRESS = "0x68D7ed9cf9881427F1dB299B90Fd63ef805dd10d";
const POOL_ADDRESS = "0x727e10f9E750C922bf9dee7620B58033F566b34F";
// @ts-expect-error enough
const TOKEN_INFO: TokenInfoWithChainDetails = { poolAddress: POOL_ADDRESS };
const LOCAL_NODE_URL = "https://local-test.com";
describe("EvmPool", () => {
  // @ts-expect-error enough
  const api: AllbridgeCoreClient = {
    getPolygonGasInfo: () =>
      new Promise((resolve) => {
        resolve({
          maxPriorityFee: POLYGON_GAS_PRICE,
          maxFee: POLYGON_MAX_PRICE,
        });
      }),
  };

  const evmPool = new EvmPool(new Web3(LOCAL_NODE_URL), api);

  beforeAll(() => {
    disableNetConnect();
  });

  afterAll(() => {
    cleanAll();
    abortPendingRequests();
  });

  test("buildRawTransactionDeposit", async () => {
    const params = {
      amount: "1000000000000000000",
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await evmPool.buildRawTransactionDeposit(params);

    expect(rawTransaction).toEqual({
      from: ACCOUNT_ADDRESS,
      to: POOL_ADDRESS,
      value: "0",
      data: "0xb6b55f250000000000000000000000000000000000000000000000000de0b6b3a7640000",
    });
  });

  test("buildRawTransactionWithdraw", async () => {
    const params = {
      amount: "1000000000000000000",
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await evmPool.buildRawTransactionWithdraw(params);

    expect(rawTransaction).toEqual({
      from: ACCOUNT_ADDRESS,
      to: POOL_ADDRESS,
      value: "0",
      data: "0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    });
  });

  test("buildRawTransactionClaimRewards", async () => {
    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: TOKEN_INFO,
    };
    const rawTransaction = await evmPool.buildRawTransactionClaimRewards(params);

    expect(rawTransaction).toEqual({
      from: ACCOUNT_ADDRESS,
      to: POOL_ADDRESS,
      value: "0",
      data: "0x372500ab",
    });
  });

  test("buildTxParams for polygon", async () => {
    const polToken = { ...TOKEN_INFO, chainSymbol: ChainSymbol.POL };
    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: polToken,
    };
    const rawTransaction = await evmPool.buildTxParams(params);

    expect(rawTransaction).toEqual({
      from: ACCOUNT_ADDRESS,
      to: POOL_ADDRESS,
      value: "0",
      maxPriorityFeePerGas: POLYGON_GAS_PRICE,
      maxFeePerGas: POLYGON_MAX_PRICE,
    });
  });

  test("getUserBalanceInfo", async () => {
    const mockNode = nock(LOCAL_NODE_URL);
    mockNode
      .post("/")
      .reply(200, rpcReply("0x0000000000000000000000000000000000000000000000000000000000000000"))
      .post("/")
      .reply(200, rpcReply("0x000000000000000000000000000000000000000000000000000000000bebc200"));

    const userBalanceInfo = await evmPool.getUserBalanceInfo(ACCOUNT_ADDRESS, TOKEN_INFO);

    expect(userBalanceInfo).toEqual({
      lpAmount: "200000000",
      rewardDebt: "0",
    });
    expect(userBalanceInfo.userLiquidity).toEqual(`200000`);
  });
});
