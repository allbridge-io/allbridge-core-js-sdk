import { Account, Asset, Horizon, Memo, Operation, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../../client/core-api/core-client-base";
import { SdkError } from "../../../../exceptions";
import { ChainSymbol, ChainType, FeePaymentMethod } from "../../../../models";
import type { NodeRpcUrlsConfig } from "../../../../services";
import { getCctpSolTokenRecipientAddress } from "../../../../services/bridge/get-cctp-sol-token-recipient-address";
import { SendParams, TokenWithChainDetails, TxSendParamsSrb } from "../../../../services/bridge/models";
import { SrbBridgeService } from "../../../../services/bridge/srb";
import { formatAddress } from "../../../../services/bridge/utils";
import { getSorobanInclusionFee, getStellarInclusionFee } from "../../../../services/models/srb/utils";

jest.mock("../../../../services/models/srb/utils", () => ({
  ...jest.requireActual("../../../../services/models/srb/utils"),
  getSorobanInclusionFee: jest.fn(),
  getStellarInclusionFee: jest.fn(),
}));

jest.mock("@stellar/stellar-sdk", () => {
  const actual = jest.requireActual("@stellar/stellar-sdk");
  return { ...actual, Horizon: { ...actual.Horizon, Server: jest.fn() } };
});

jest.mock("../../../../services/bridge/get-cctp-sol-token-recipient-address", () => ({
  getCctpSolTokenRecipientAddress: jest.fn(),
}));

describe("SrbBridgeService", () => {
  const fromAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"; // cSpell:disable-line
  const toAddress = "0x01237296aaF2ba01AC9a819813E260Bb4Ad6642d";
  const nodeRpcUrlsConfig = {
    getNodeRpcUrl: jest.fn((chainSymbol: ChainSymbol) =>
      chainSymbol === ChainSymbol.SOL ? "https://solana.example" : "https://soroban.example"
    ),
  } as unknown as NodeRpcUrlsConfig;
  const params: TxSendParamsSrb = {
    amount: "300000",
    contractAddress: "CCTP_BRIDGE",
    fromChainId: 7,
    fromChainSymbol: ChainSymbol.SRB,
    fromAccountAddress: fromAddress,
    fromTokenAddress: Array(32).fill(0),
    toChainId: 4,
    toAccountAddress: formatAddress(toAddress, ChainType.EVM, ChainType.SRB),
    toTokenAddress: Array(32).fill(0),
    messenger: Messenger.CCTP_V2,
    fee: "100",
    gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
  };

  it("resolves a Solana wallet recipient to a token account for CCTPv2 sends", async () => {
    const solWalletAddress = "A7ccoA2bQEVJV6cM8ZBrtd5tP1op2DHAiNaSQrA7XUsd";
    const solTokenAddress = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    const solRecipientTokenAccount = formatAddress(
      "9xQeWvG816bUx9EPfMtByM1ea7DbnYuzcZP9wSNaU8gS",
      ChainType.SOLANA,
      ChainType.SRB
    );
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    const bridge = jest.fn().mockResolvedValue({ toXDR: jest.fn().mockReturnValue("cctp-xdr") });
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({ bridge });
    jest.mocked(getCctpSolTokenRecipientAddress).mockResolvedValue(solRecipientTokenAccount);

    const sendParams: SendParams = {
      amount: "0.303",
      fromAccountAddress: fromAddress,
      toAccountAddress: solWalletAddress,
      sourceToken: {
        allbridgeChainId: 7,
        chainSymbol: ChainSymbol.SRB,
        chainType: ChainType.SRB,
        cctpV2Address: "CCTP_BRIDGE",
        decimals: 6,
        tokenAddress: "CAYUCAP2ORC5PSASKC63MQGMB6X62YXDADCSPDBZNHHHG33GKNZUYROB", // cSpell:disable-line
      } as TokenWithChainDetails,
      destinationToken: {
        allbridgeChainId: 4,
        chainSymbol: ChainSymbol.SOL,
        chainType: ChainType.SOLANA,
        cctpV2Address: "SOL_CCTP_BRIDGE",
        decimals: 6,
        tokenAddress: solTokenAddress,
      } as TokenWithChainDetails,
      messenger: Messenger.CCTP_V2,
      fee: "100",
      gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
    };

    await expect(service.buildRawTransactionSend(sendParams)).resolves.toBe("cctp-xdr");
    expect(getCctpSolTokenRecipientAddress).toHaveBeenCalledWith(
      ChainType.SRB,
      solWalletAddress,
      solTokenAddress,
      "https://solana.example"
    );
    expect(bridge).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: Buffer.from(solRecipientTokenAccount),
      }),
      { fee: 123 }
    );
  });

  it("builds a CCTPv2 native-fee bridge transaction", async () => {
    const bridge = jest.fn().mockResolvedValue({ toXDR: jest.fn().mockReturnValue("cctp-xdr") });
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({ bridge });

    await expect(service.buildRawTransactionSendFromParams(params)).resolves.toBe("cctp-xdr");
    expect(bridge).toHaveBeenCalledWith(
      {
        sender: fromAddress,
        amount: 300000n,
        recipient: Buffer.from(formatAddress(toAddress, ChainType.EVM, ChainType.SRB)),
        destination_chain_id: 4,
        gas_amount: 100n,
        fee_token_amount: 0n,
      },
      { fee: 123 }
    );
  });

  it("builds a CCTPv2 stablecoin-fee bridge transaction", async () => {
    const bridge = jest.fn().mockResolvedValue({ toXDR: jest.fn().mockReturnValue("cctp-xdr") });
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({ bridge });

    await expect(
      service.buildRawTransactionSendFromParams({
        ...params,
        fee: "200",
        extraGas: "30",
        gasFeePaymentMethod: FeePaymentMethod.WITH_STABLECOIN,
      })
    ).resolves.toBe("cctp-xdr");
    expect(bridge).toHaveBeenCalledWith(
      expect.objectContaining({
        gas_amount: 0n,
        fee_token_amount: 230n,
      }),
      { fee: 123 }
    );
  });

  it("rejects CCTPv2 ABR-fee transactions with the intended SDK error", async () => {
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({});

    try {
      await service.buildRawTransactionSendFromParams({
        ...params,
        gasFeePaymentMethod: FeePaymentMethod.WITH_ABR,
      });
      fail("Expected CCTPv2 ABR payment to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(SdkError);
      expect(error).toHaveProperty("message", "SRB CCTPv2 bridge does not support ABR payment method");
    }
  });

  it("rejects unsupported CCTPv2 fee payment methods", async () => {
    const bridge = jest.fn().mockResolvedValue({ toXDR: jest.fn().mockReturnValue("cctp-xdr") });
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({ bridge });

    await expect(
      service.buildRawTransactionSendFromParams({ ...params, gasFeePaymentMethod: 99 as FeePaymentMethod })
    ).rejects.toThrow("Unhandled FeePaymentMethod");
  });

  it("uses the legacy contract for an Allbridge native-fee transaction", async () => {
    const swap_and_bridge = jest.fn().mockResolvedValue({ toXDR: jest.fn().mockReturnValue("legacy-xdr") });
    const service = new SrbBridgeService(
      nodeRpcUrlsConfig,
      { sorobanNetworkPassphrase: "Test SDF Network ; September 2015" },
      {} as AllbridgeCoreClient
    );
    jest.mocked(getSorobanInclusionFee).mockResolvedValue(123);
    jest.spyOn(service, "getContract").mockReturnValue({ swap_and_bridge });

    await expect(
      service.buildRawTransactionSendFromParams({ ...params, messenger: Messenger.ALLBRIDGE })
    ).resolves.toBe("legacy-xdr");
    expect(swap_and_bridge).toHaveBeenCalledWith(
      expect.objectContaining({
        gas_amount: 100n,
        fee_token_amount: 0n,
      }),
      { fee: 123 }
    );
  });

  describe("buildRawTransactionTransfer (NEAR Intents deposit)", () => {
    const networkPassphrase = "Test SDF Network ; September 2015";
    const depositAddress = "GBR6V5TMSWANIT44APVQ3LXJF5NXGGW77WS3NMLGATIF7ZKIBXJS2W7K"; // cSpell:disable-line
    const usdcIssuer = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // cSpell:disable-line
    const stlrNodeRpcUrlsConfig = {
      getNodeRpcUrl: jest.fn((chainSymbol: ChainSymbol) =>
        chainSymbol === ChainSymbol.STLR ? "https://horizon.example" : "https://soroban.example"
      ),
    } as unknown as NodeRpcUrlsConfig;
    const usdcToken = {
      chainSymbol: ChainSymbol.SRB,
      decimals: 7,
      tokenAddress: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75", // cSpell:disable-line
      originTokenAddress: `USDC:${usdcIssuer}`,
    } as TokenWithChainDetails;
    let loadAccount: jest.Mock;
    let service: SrbBridgeService;

    beforeEach(() => {
      loadAccount = jest.fn().mockResolvedValue(new Account(fromAddress, "41"));
      jest.mocked(Horizon.Server).mockImplementation(() => ({ loadAccount }) as unknown as Horizon.Server);
      jest.mocked(getStellarInclusionFee).mockResolvedValue(250);
      service = new SrbBridgeService(
        stlrNodeRpcUrlsConfig,
        { sorobanNetworkPassphrase: networkPassphrase },
        {} as AllbridgeCoreClient
      );
    });

    function decode(xdr: unknown): Transaction {
      return TransactionBuilder.fromXDR(xdr as string, networkPassphrase) as Transaction;
    }

    it("builds a payment of the classic asset with the deposit memo as text", async () => {
      const xdr = await service.buildRawTransactionTransfer({
        amount: "13300000",
        token: usdcToken,
        fromAccountAddress: fromAddress,
        toAddress: depositAddress,
        memo: "7730571183",
      });

      expect(Horizon.Server).toHaveBeenCalledWith("https://horizon.example");
      expect(loadAccount).toHaveBeenCalledWith(fromAddress);
      expect(getStellarInclusionFee).toHaveBeenCalledWith("https://soroban.example");
      const tx = decode(xdr);
      expect(tx.source).toEqual(fromAddress);
      expect(tx.sequence).toEqual("42");
      expect(tx.fee).toEqual("250");
      expect(tx.memo.type).toEqual(Memo.text("x").type);
      expect(tx.memo.value?.toString()).toEqual("7730571183");
      expect(tx.operations).toHaveLength(1);
      const operation = tx.operations[0] as Operation.Payment;
      expect(operation.type).toEqual("payment");
      expect(operation.destination).toEqual(depositAddress);
      expect(operation.amount).toEqual("1.3300000");
      expect(operation.asset.equals(new Asset("USDC", usdcIssuer))).toBe(true);
    });

    it("builds an XLM payment for a native token", async () => {
      const xdr = await service.buildRawTransactionTransfer({
        amount: "25000000",
        token: {
          ...usdcToken,
          tokenAddress: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA", // cSpell:disable-line
          originTokenAddress: undefined,
          isNative: true,
        },
        fromAccountAddress: fromAddress,
        toAddress: depositAddress,
        memo: "memo",
      });

      const operation = decode(xdr).operations[0] as Operation.Payment;
      expect(operation.asset.isNative()).toBe(true);
      expect(operation.amount).toEqual("2.5000000");
      expect(operation.destination).toEqual(depositAddress);
    });

    it("rejects a transfer without a deposit memo", async () => {
      await expect(
        service.buildRawTransactionTransfer({
          amount: "1",
          token: usdcToken,
          fromAccountAddress: fromAddress,
          toAddress: depositAddress,
        })
      ).rejects.toThrow(new SdkError("Stellar transfer requires a deposit memo"));
      expect(loadAccount).not.toHaveBeenCalled();
    });

    it("rejects a token without a CODE:ISSUER originTokenAddress", async () => {
      await expect(
        service.buildRawTransactionTransfer({
          amount: "1",
          token: { ...usdcToken, originTokenAddress: undefined },
          fromAccountAddress: fromAddress,
          toAddress: depositAddress,
          memo: "memo",
        })
      ).rejects.toThrow("SRB token must contain 'originTokenAddress' in the 'CODE:ISSUER' format");
    });
  });
});
