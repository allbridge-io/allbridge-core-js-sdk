import { abortPendingRequests, cleanAll, disableNetConnect } from "nock";
import { Web3 } from "web3";
import { ChainSymbol } from "../../../../chains/chain.enums";
import { AllbridgeCoreClientWithPoolInfo } from "../../../../client/core-api/core-client-base";
import { EvmPoolService } from "../../../../services/liquidity-pool/evm";
import { TokenWithChainDetails } from "../../../../tokens-info";

const ACCOUNT_ADDRESS = "0xb3A88d47eEda762610C4D86Ea6c8562288d53dfA";
const POOL_ADDRESS = "0x57FB363e8e96B086cc16E0f35b369a14b1Ac1AC2";
// @ts-expect-error enough
const TOKEN_INFO: TokenWithChainDetails = { poolAddress: POOL_ADDRESS };
const LOCAL_NODE_URL = "https://goerli.infura.io/";
describe("EvmPool", () => {
  // @ts-expect-error enough
  const api: AllbridgeCoreClientWithPoolInfo = {};

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

  test("buildTxParams for polygon", () => {
    const polToken = { ...TOKEN_INFO, chainSymbol: ChainSymbol.POL };
    const params = {
      accountAddress: ACCOUNT_ADDRESS,
      token: polToken,
    };
    const rawTransaction = evmPool.buildTxParams(params);

    expect(rawTransaction).toEqual({
      from: ACCOUNT_ADDRESS,
      to: POOL_ADDRESS,
      value: "0",
    });
  });
});
