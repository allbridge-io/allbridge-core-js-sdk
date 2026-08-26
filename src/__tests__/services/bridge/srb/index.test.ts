import { Messenger } from "../../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../../client/core-api/core-client-base";
import { SdkError } from "../../../../exceptions";
import { ChainSymbol, ChainType, FeePaymentMethod } from "../../../../models";
import type { NodeRpcUrlsConfig } from "../../../../services";
import { getCctpSolTokenRecipientAddress } from "../../../../services/bridge/get-cctp-sol-token-recipient-address";
import { SendParams, TokenWithChainDetails, TxSendParamsSrb } from "../../../../services/bridge/models";
import { SrbBridgeService } from "../../../../services/bridge/srb";
import { formatAddress } from "../../../../services/bridge/utils";
import { getSorobanInclusionFee } from "../../../../services/models/srb/utils";

jest.mock("../../../../services/models/srb/utils", () => ({
  ...jest.requireActual("../../../../services/models/srb/utils"),
  getSorobanInclusionFee: jest.fn(),
}));

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
});
