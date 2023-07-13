import { abortPendingRequests, cleanAll, disableNetConnect, load } from "nock";
import Web3 from "web3";
import { ChainSymbol } from "../../../../chains";
import { AllbridgeCoreClient } from "../../../../client/core-api";
import { EvmPoolService } from "../../../../services/liquidity-pool/evm";
import { TokenWithChainDetails } from "../../../../tokens-info";

const POLYGON_GAS_PRICE = "1433333332";
const POLYGON_MAX_PRICE = "1433333348";
const ACCOUNT_ADDRESS = "0xb3A88d47eEda762610C4D86Ea6c8562288d53dfA";
const POOL_ADDRESS = "0x57FB363e8e96B086cc16E0f35b369a14b1Ac1AC2";
// @ts-expect-error enough
const TOKEN_INFO: TokenWithChainDetails = { poolAddress: POOL_ADDRESS };
const LOCAL_NODE_URL = "https://goerli.infura.io/";
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

  const evmPool = new EvmPoolService(new Web3(LOCAL_NODE_URL), api);

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
    nockRequests("get-user-balance-info");

    const userBalanceInfo = await evmPool.getUserBalanceInfo(ACCOUNT_ADDRESS, TOKEN_INFO);

    expect(userBalanceInfo).toEqual({
      lpAmount: "9986",
      rewardDebt: "4004975208993305",
    });
    expect(userBalanceInfo.userLiquidity).toEqual(`9.986`);
  });
});

function nockRequests(recName: string) {
  const nocks = load(`./src/__tests__/services/liquidity-pool/evm/data/nock/${recName}-rec.json`);
  nocks.forEach(function (nock) {
    nock.filteringRequestBody((b) => {
      try {
        const body = JSON.parse(b);
        body[0].id = 8551125359729656;
        body[1].id = 8551125359729657;
        return JSON.stringify(body);
      } catch (e) {
        return b;
      }
    });
  });
}
