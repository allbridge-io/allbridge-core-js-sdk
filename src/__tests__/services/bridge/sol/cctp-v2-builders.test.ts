import { AccountClient, BN, Program } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { StrKey } from "@stellar/stellar-sdk";
import { ChainType } from "../../../../chains/chain.enums";
import { Messenger } from "../../../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../../../client/core-api/core-client-base";
import { SdkError } from "../../../../exceptions";
import { encodeCctpHookForStellar } from "../../../../services/bridge/cctp-utils";
import { BridgeTxService, SolanaBridgeParams } from "../../../../services/bridge/sol/bridge-tx-service";
import { PayerWithTokenService } from "../../../../services/bridge/sol/payer-with-token-service";
import { convertToVersionedTransaction } from "../../../../services/bridge/sol/utils";
import { CctpV2Bridge } from "../../../../services/models/sol/types/cctp_v2_bridge";
import {
  getCctpV2BridgeConfigAccount,
  getCctpV2ChainBridgeAccount,
  getPriceAccount,
} from "../../../../services/utils/sol/accounts";

jest.mock("../../../../services/bridge/sol/utils", () => ({
  ...jest.requireActual("../../../../services/bridge/sol/utils"),
  convertToVersionedTransaction: jest.fn(),
}));

const PUBLIC_KEY = new PublicKey("11111111111111111111111111111111");
const OTHER_BRIDGE = new PublicKey("SysvarC1ock11111111111111111111111111111111");
const STELLAR_CCTP_CONTRACT = "CAYUCAP2ORC5PSASKC63MQGMB6X62YXDADCSPDBZNHHHG33GKNZUYROB"; // cSpell:disable-line
// The post-audit devnet deployment: the route PDA below exists on chain, the one without the config seed does not
const DEVNET_CCTP_V2_BRIDGE = "FxBkz15NLjPRdNmp41zZaEDy28skxDdMRadvjuxKHr4w"; // cSpell:disable-line
const DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // cSpell:disable-line
const DEVNET_GAS_ORACLE = "GTwX3oTgMS4pLQS8SvgZFS9Vyhxdfw1N7fijAhaS88Ff"; // cSpell:disable-line
const amount = new BN(1000);

describe("getCctpV2ChainBridgeAccount", () => {
  it("seeds the route with the config of the mint", () => {
    const programId = new PublicKey(DEVNET_CCTP_V2_BRIDGE);
    const config = getCctpV2BridgeConfigAccount(new PublicKey(DEVNET_USDC), programId);

    expect(getCctpV2ChainBridgeAccount(7, config, programId).toBase58()).toEqual(
      "6RH8fZd7YecaLRqAz61BGJSUsXG2VaBPRMe7X2NzmJpP" // cSpell:disable-line
    );
  });
});
const hookData = Buffer.from([0, 0, 0, 1, 65]);

function createMethod() {
  const transaction = new Transaction();
  const method = {
    accounts: jest.fn(),
    preInstructions: jest.fn(),
    postInstructions: jest.fn(),
    transaction: jest.fn().mockResolvedValue(transaction),
  };
  method.accounts.mockReturnValue(method);
  method.preInstructions.mockReturnValue(method);
  method.postInstructions.mockReturnValue(method);
  return method;
}

describe("BridgeTxService CCTPv2 native builder", () => {
  const params = {
    solanaLookUpTable: PUBLIC_KEY.toBase58(),
    cctpParams: {
      cctpDomains: { SRB: 7 },
      cctpV2TransmitterProgramId: PUBLIC_KEY.toBase58(),
      cctpV2TokenMessengerMinter: PUBLIC_KEY.toBase58(),
    },
  } as SolanaBridgeParams;
  const service = new BridgeTxService("https://solana.example", params, {} as AllbridgeCoreClient);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(convertToVersionedTransaction).mockResolvedValue({});
  });

  function createPreparedData(destinationHookData?: Buffer) {
    const bridgeMethod = createMethod();
    const bridgeToStellarMethod = createMethod();
    const bridge = jest.fn().mockReturnValue(bridgeMethod);
    const bridgeToStellar = jest.fn().mockReturnValue(bridgeToStellarMethod);
    const program = {
      methods: { bridge, bridgeToStellar },
    } as unknown as Program<CctpV2Bridge>;
    const connection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: PUBLIC_KEY.toBase58() }),
    };

    return {
      bridge,
      bridgeToStellar,
      data: {
        amount,
        cctpBridge: program,
        chainBridgeAccount: PUBLIC_KEY,
        destinationChainId: 7,
        gasPrice: PUBLIC_KEY,
        hookData: destinationHookData,
        mint: PUBLIC_KEY,
        provider: { connection },
        receiveToken: Array(32).fill(0),
        recipient: Array.from(OTHER_BRIDGE.toBytes()),
        thisGasPrice: PUBLIC_KEY,
        userAccount: PUBLIC_KEY,
        userToken: PUBLIC_KEY,
      } as unknown as Parameters<BridgeTxService["buildSwapAndBridgeCctpV2Transaction"]>[1],
    };
  }

  describe("prepared data", () => {
    const sendParams = {
      messenger: Messenger.CCTP_V2,
      destinationToken: { chainSymbol: "ARB", chainType: ChainType.EVM },
    };
    const txSendParams = {
      contractAddress: DEVNET_CCTP_V2_BRIDGE,
      amount: "1000",
      fromAccountAddress: PUBLIC_KEY.toBase58(),
      fromTokenAddress: DEVNET_USDC,
      toChainId: 6,
      toAccountAddress: Buffer.alloc(32, 1),
      toTokenAddress: Buffer.alloc(32, 2),
    };

    function prepare(serviceParams: SolanaBridgeParams) {
      const preparingService = new BridgeTxService(
        "https://solana.example",
        serviceParams,
        {} as AllbridgeCoreClient
      ) as unknown as {
        prepareSwapAndBridgeCctpV2Data: (
          sendParams: unknown,
          txSendParams: unknown
        ) => Promise<Record<string, unknown>>;
      };
      return preparingService.prepareSwapAndBridgeCctpV2Data(sendParams, txSendParams);
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("derives the route from the config and the gas prices from the configured oracle", async () => {
      jest.spyOn(AccountClient.prototype, "fetch").mockResolvedValue({ stellarChainId: 7 });

      const prepared = await prepare({
        ...params,
        cctpParams: { ...params.cctpParams, cctpV2GasOracleProgramId: DEVNET_GAS_ORACLE },
      });

      expect(prepared.chainBridgeAccount).toEqual(
        getCctpV2ChainBridgeAccount(
          6,
          getCctpV2BridgeConfigAccount(new PublicKey(DEVNET_USDC), new PublicKey(DEVNET_CCTP_V2_BRIDGE)),
          new PublicKey(DEVNET_CCTP_V2_BRIDGE)
        )
      );
      expect(prepared.gasPrice).toEqual(await getPriceAccount(6, new PublicKey(DEVNET_GAS_ORACLE)));
      expect(prepared.thisGasPrice).toEqual(await getPriceAccount(4, new PublicKey(DEVNET_GAS_ORACLE)));
    });

    it("fails when the gas oracle is not configured", async () => {
      const fetch = jest.spyOn(AccountClient.prototype, "fetch");

      await expect(prepare(params)).rejects.toThrow(SdkError);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it("uses bridgeToStellar when prepared destination data contains a hook", async () => {
    const { bridge, bridgeToStellar, data } = createPreparedData(hookData);

    await service.buildSwapAndBridgeCctpV2Transaction("SRB", data);

    expect(bridgeToStellar).toHaveBeenCalledWith({
      amount,
      hookData,
    });
    expect(bridge).not.toHaveBeenCalled();
  });

  it("uses bridge when prepared destination data has no hook", async () => {
    const { bridge, bridgeToStellar, data } = createPreparedData();

    await service.buildSwapAndBridgeCctpV2Transaction("SRB", data);

    expect(bridge).toHaveBeenCalledWith({
      amount,
      destinationChainId: 7,
      recipient: Array.from(OTHER_BRIDGE.toBytes()),
      receiveToken: Array(32).fill(0),
    });
    expect(bridgeToStellar).not.toHaveBeenCalled();
  });
});

describe("PayerWithTokenService CCTPv2 ABR builder", () => {
  const params = {
    solanaLookUpTable: PUBLIC_KEY.toBase58(),
    cctpParams: {
      cctpDomains: { SRB: 7 },
      cctpTransmitterProgramId: PUBLIC_KEY.toBase58(),
      cctpTokenMessengerMinter: PUBLIC_KEY.toBase58(),
      cctpV2TransmitterProgramId: PUBLIC_KEY.toBase58(),
      cctpV2TokenMessengerMinter: PUBLIC_KEY.toBase58(),
    },
  } as SolanaBridgeParams;
  const service = new PayerWithTokenService("https://solana.example", params, {} as AllbridgeCoreClient);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(convertToVersionedTransaction).mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createPreparedData(destinationHookData?: Buffer) {
    const method = createMethod();
    const bridgeCctpV2 = jest.fn().mockReturnValue(method);
    const connection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: PUBLIC_KEY.toBase58() }),
    };

    return {
      bridgeCctpV2,
      data: {
        amount,
        recipient: Array.from(OTHER_BRIDGE.toBytes()),
        recipientToken: Array(32).fill(0),
        recipientChain: 7,
        maxFeeAmount: new BN(10),
        extraGasAmountInFeeToken: new BN(2),
        hookData: destinationHookData,
        payerProgram: { methods: { bridgeCctpV2 } },
        provider: { connection },
        userAccount: PUBLIC_KEY,
        messageSentEventDataKeypair: { publicKey: PUBLIC_KEY },
      },
    };
  }

  async function build(data: ReturnType<typeof createPreparedData>["data"]) {
    const buildBridgeCctpV2Tx = (
      service as unknown as {
        buildBridgeCctpV2Tx: (preparedData: unknown) => Promise<unknown>;
      }
    ).buildBridgeCctpV2Tx.bind(service);
    await buildBridgeCctpV2Tx(data);
  }

  it("serializes SRB hook data in payer arguments", async () => {
    const { bridgeCctpV2, data } = createPreparedData(hookData);

    await build(data);

    expect(bridgeCctpV2).toHaveBeenCalledWith({
      amount,
      recipient: Array.from(OTHER_BRIDGE.toBytes()),
      receiveToken: Array(32).fill(0),
      destinationChainId: 7,
      maxFeeAmount: new BN(10),
      extraGasAmountInFeeToken: new BN(2),
      hookData,
    });
  });

  it("serializes absent non-SRB hook data as null", async () => {
    const { bridgeCctpV2, data } = createPreparedData();

    await build(data);

    expect(bridgeCctpV2).toHaveBeenCalledWith({
      amount,
      recipient: Array.from(OTHER_BRIDGE.toBytes()),
      receiveToken: Array(32).fill(0),
      destinationChainId: 7,
      maxFeeAmount: new BN(10),
      extraGasAmountInFeeToken: new BN(2),
      hookData: null,
    });
  });

  it("uses the Stellar CCTPv2 contract id from the SRB destination token", async () => {
    const destination = {
      recipient: Array.from(StrKey.decodeContract(STELLAR_CCTP_CONTRACT)),
      receiveToken: Array(32).fill(0),
      hookData,
    };
    const provider = { connection: {} };
    const baseData = {
      mintAccount: PUBLIC_KEY,
      provider,
      recipient: [1],
      recipientToken: [2],
    };
    jest.spyOn(service, "prepareSwapAndBridgeBaseData").mockResolvedValue(baseData);
    const sendParams = {
      messenger: Messenger.CCTP_V2,
      destinationToken: {
        chainSymbol: "SRB",
        chainType: ChainType.SRB,
        cctpV2Address: STELLAR_CCTP_CONTRACT,
      },
      sourceToken: { cctpV2Address: PUBLIC_KEY.toBase58() },
      toAccountAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", // cSpell:disable-line
    };
    const solTxSendParams = { amount: "1000", toChainId: 7 };
    const prepareBridgeCctpData = (
      service as unknown as {
        prepareBridgeCctpData: (bridgeParams: unknown, txParams: unknown) => Promise<Record<string, unknown>>;
      }
    ).prepareBridgeCctpData.bind(service);

    const prepared = await prepareBridgeCctpData(sendParams, solTxSendParams);

    const configAccount = getCctpV2BridgeConfigAccount(PUBLIC_KEY, PUBLIC_KEY);
    expect(prepared).toEqual(
      expect.objectContaining({
        recipient: destination.recipient,
        recipientToken: [2],
        hookData: encodeCctpHookForStellar(sendParams.toAccountAddress),
        cctpBridgeConfigAccount: configAccount,
        chainBridgeAccount: getCctpV2ChainBridgeAccount(7, configAccount, PUBLIC_KEY),
      })
    );
  });

  it("leaves CCTPv1 destination data unchanged", async () => {
    const provider = { connection: {} };
    const baseData = {
      mintAccount: PUBLIC_KEY,
      provider,
      recipient: [1],
      recipientToken: [2],
    };
    jest.spyOn(service, "prepareSwapAndBridgeBaseData").mockResolvedValue(baseData);
    const prepareBridgeCctpData = (
      service as unknown as {
        prepareBridgeCctpData: (bridgeParams: unknown, txParams: unknown) => Promise<Record<string, unknown>>;
      }
    ).prepareBridgeCctpData.bind(service);

    const prepared = await prepareBridgeCctpData(
      {
        messenger: Messenger.CCTP,
        destinationToken: { chainSymbol: "SRB", chainType: ChainType.SRB },
        sourceToken: { cctpAddress: PUBLIC_KEY.toBase58() },
      },
      { amount: "1000", toChainId: 7 }
    );

    expect(prepared).toEqual(expect.objectContaining({ recipient: [1], recipientToken: [2], hookData: undefined }));
  });
});
