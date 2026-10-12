import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { Connection, PublicKey } from "@solana/web3.js";
import { Horizon, NotFoundError } from "@stellar/stellar-sdk";
import { TronWeb } from "tronweb";
import { ChainSymbol } from "../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { AllbridgeCoreSdkOptions } from "../../../index";
import { NodeRpcUrlsConfig } from "../../../services";
import { SolanaTokenService } from "../../../services/token/sol";
import { SrbTokenService } from "../../../services/token/srb";
import { SuiTokenService } from "../../../services/token/sui";
import { TronTokenService } from "../../../services/token/trx";
import { TokenCoreFields } from "../../../tokens-info";
import { initChainsWithTestnet } from "../../mock/utils";

jest.mock("@stellar/stellar-sdk", () => {
  const actual = jest.requireActual("@stellar/stellar-sdk");
  return { ...actual, Horizon: { ...actual.Horizon, Server: jest.fn() } };
});

initChainsWithTestnet();

const api = {} as AllbridgeCoreClient;

describe("ChainTokenService.getTokenBalance for a native token", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("☀ SOL returns the lamports balance", async () => {
    const getBalance = jest.spyOn(Connection.prototype, "getBalance").mockResolvedValue(1500000000);
    const account = "A7ccoA2bQEVJV6cM8ZBrtd5tP1op2DHAiNaSQrA7XUsd"; // cSpell:disable-line
    const token: TokenCoreFields = {
      chainSymbol: ChainSymbol.SOL,
      decimals: 9,
      tokenAddress: "So11111111111111111111111111111111111111112",
      isNative: true,
    };

    const actual = await new SolanaTokenService("https://solana.example", api).getTokenBalance({ account, token });

    expect(actual).toEqual("1500000000");
    expect(getBalance).toHaveBeenCalledWith(new PublicKey(account));
  });

  test("☀ TRX returns the sun balance", async () => {
    const getBalance = jest.fn().mockResolvedValue(25000000);
    const contract = jest.fn();
    const tronWeb = { trx: { getBalance }, contract } as unknown as TronWeb;
    const account = "TB4K8DV1CDsuT6SGdQ2L2je4XG88KSrgRh"; // cSpell:disable-line

    const actual = await new TronTokenService(tronWeb, api).getTokenBalance({
      account,
      token: {
        chainSymbol: ChainSymbol.TRX,
        decimals: 6,
        tokenAddress: "TXka46PPwttNPWfFDPtt3GUodbPThyufaV", // cSpell:disable-line
        isNative: true,
      },
    });

    expect(actual).toEqual("25000000");
    expect(getBalance).toHaveBeenCalledWith(account);
    expect(contract).not.toHaveBeenCalled();
  });

  describe("SRB", () => {
    const account = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"; // cSpell:disable-line
    const token: TokenCoreFields = {
      chainSymbol: ChainSymbol.SRB,
      decimals: 7,
      tokenAddress: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA", // cSpell:disable-line
      isNative: true,
    };
    const service = new SrbTokenService(
      new NodeRpcUrlsConfig({ [ChainSymbol.STLR]: "https://horizon.example" }),
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" } as AllbridgeCoreSdkOptions,
      api
    );

    function mockLoadAccount(loadAccount: jest.Mock) {
      jest.mocked(Horizon.Server).mockImplementation(() => ({ loadAccount }) as unknown as Horizon.Server);
    }

    test("☀ returns the XLM balance in 7-decimal units", async () => {
      const loadAccount = jest.fn().mockResolvedValue({
        balances: [
          { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "G", balance: "9.0000000" },
          { asset_type: "native", balance: "12.3456789" },
        ],
      });
      mockLoadAccount(loadAccount);

      expect(await service.getTokenBalance({ account, token })).toEqual("123456789");
      expect(Horizon.Server).toHaveBeenCalledWith("https://horizon.example");
      expect(loadAccount).toHaveBeenCalledWith(account);
    });

    test("☀ returns 0 for an account that does not exist", async () => {
      mockLoadAccount(jest.fn().mockRejectedValue(new NotFoundError("Not Found", {})));

      expect(await service.getTokenBalance({ account, token })).toEqual("0");
    });

    test("☁ rethrows other Horizon errors", async () => {
      mockLoadAccount(jest.fn().mockRejectedValue(new Error("Horizon is down")));

      await expect(service.getTokenBalance({ account, token })).rejects.toThrow("Horizon is down");
    });
  });

  test("☀ SUI returns the mist balance", async () => {
    const getBalance = jest.fn().mockResolvedValue({ totalBalance: "2500000000" });
    const service = new SuiTokenService("https://sui.example", { suiIsTestnet: true } as AllbridgeCoreSdkOptions, api);
    (service as unknown as { suiClient: { getBalance: jest.Mock } }).suiClient = { getBalance };
    const account = "0x" + "11".repeat(32);

    const actual = await service.getTokenBalance({
      account,
      token: { chainSymbol: ChainSymbol.SUI, decimals: 9, tokenAddress: "0x2::sui::SUI", isNative: true },
    });

    expect(actual).toEqual("2500000000");
    expect(getBalance).toHaveBeenCalledWith({ owner: account, coinType: SUI_TYPE_ARG });
  });
});
