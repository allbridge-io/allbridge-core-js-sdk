import { Account, Horizon, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { mainnet } from "../../../configs";
import { NodeRpcUrlsConfig } from "../../../services";
import { DefaultSrbUtils } from "../../../utils/srb";

describe("DefaultSrbUtils.submitTransactionStellar", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("decodes the transaction with the network passphrase, not the Horizon URL", async () => {
    const source = Keypair.random();
    const transaction = new TransactionBuilder(new Account(source.publicKey(), "1"), {
      fee: "100",
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(Operation.bumpSequence({ bumpTo: "2" }))
      .setTimeout(180)
      .build();
    transaction.sign(source);
    const submitTransaction = jest.spyOn(Horizon.Server.prototype, "submitTransaction").mockResolvedValue({});
    const utils = new DefaultSrbUtils(
      new NodeRpcUrlsConfig({ STLR: "https://horizon.example", SRB: "https://soroban.example" }),
      mainnet
    );

    await utils.submitTransactionStellar(transaction.toXdr());

    const submitted = submitTransaction.mock.calls[0]?.[0];
    expect(submitted?.networkPassphrase).toEqual(Networks.PUBLIC);
    expect(submitted?.hash()).toEqual(transaction.hash());
  });
});
