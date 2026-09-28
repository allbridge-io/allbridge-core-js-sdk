import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeStructTag } from "@mysten/sui/utils";
import { ChainSymbol } from "../../../../chains/chain.enums";
import { AllbridgeCoreClient } from "../../../../client/core-api/core-client-base";
import { NodeRpcUrlsConfig } from "../../../../services";
import { TokenWithChainDetails } from "../../../../services/bridge/models";
import { SuiBridgeService } from "../../../../services/bridge/sui";

const USDC_TYPE = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"; // cSpell:disable-line

describe("SuiBridgeService.buildRawTransactionTransfer", () => {
  const sender = "0x" + "11".repeat(32);
  const depositAddress = "0x" + "22".repeat(32);
  let service: SuiBridgeService;
  let toJSON: jest.SpyInstance;

  beforeEach(() => {
    service = new SuiBridgeService(
      new NodeRpcUrlsConfig({ [ChainSymbol.SUI]: "https://sui.example" }),
      { suiIsTestnet: true } as never,
      {} as AllbridgeCoreClient
    );
    toJSON = jest.spyOn(Transaction.prototype, "toJSON").mockResolvedValue("sui-tx-json");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function getBuiltData() {
    expect(toJSON).toHaveBeenCalledTimes(1);
    return (toJSON.mock.contexts[0] as Transaction).getData();
  }

  /** Asserts `sender` transfers the first command's result to the deposit address; returns that first command. */
  function expectTransferToDeposit() {
    const data = getBuiltData();
    expect(data.sender).toEqual(sender);
    expect(data.commands).toHaveLength(2);
    const [intent, transfer] = data.commands;
    expect(transfer?.$kind).toEqual("TransferObjects");
    expect(transfer?.TransferObjects?.objects).toEqual([{ $kind: "Result", Result: 0 }]);
    const addressArg = transfer?.TransferObjects?.address;
    expect(addressArg?.$kind).toEqual("Input");
    const input = addressArg?.$kind === "Input" ? data.inputs[addressArg.Input] : undefined;
    expect(input?.Pure?.bytes).toEqual(bcs.Address.serialize(depositAddress).toBase64());
    return intent;
  }

  test("☀ transfers a coin of the token type split from the sender's coins", async () => {
    const actual = await service.buildRawTransactionTransfer({
      amount: "1330000",
      token: {
        chainSymbol: ChainSymbol.SUI,
        decimals: 6,
        tokenAddress: USDC_TYPE.split("::")[0],
        originTokenAddress: USDC_TYPE,
      } as TokenWithChainDetails,
      fromAccountAddress: sender,
      toAddress: depositAddress,
    });

    expect(actual).toEqual("sui-tx-json");
    const intent = expectTransferToDeposit();
    expect(intent?.$kind).toEqual("$Intent");
    expect(intent?.$Intent?.name).toEqual("CoinWithBalance");
    expect(intent?.$Intent?.data).toEqual({
      type: normalizeStructTag(USDC_TYPE),
      balance: 1330000n,
      outputKind: "coin",
    });
  });

  test("☀ transfers SUI from the gas coin for a native token", async () => {
    await service.buildRawTransactionTransfer({
      amount: "2500000000",
      token: {
        chainSymbol: ChainSymbol.SUI,
        decimals: 9,
        tokenAddress: "0x2::sui::SUI",
        isNative: true,
      } as TokenWithChainDetails,
      fromAccountAddress: sender,
      toAddress: depositAddress,
    });

    const intent = expectTransferToDeposit();
    expect(intent?.$Intent?.data).toEqual({ type: "gas", balance: 2500000000n, outputKind: "coin" });
  });

  test("☁ rejects a token without originTokenAddress", async () => {
    await expect(
      service.buildRawTransactionTransfer({
        amount: "1",
        token: { chainSymbol: ChainSymbol.SUI, decimals: 6, tokenAddress: "0xabc" } as TokenWithChainDetails,
        fromAccountAddress: sender,
        toAddress: depositAddress,
      })
    ).rejects.toThrow("SUI token must contain 'originTokenAddress'");
  });
});
