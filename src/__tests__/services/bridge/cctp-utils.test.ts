import { encodeMuxedContractAddress, StrKey } from "@stellar/stellar-sdk";
import { encodeCctpHookForStellar } from "../../../services/bridge/cctp-utils";

const G_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"; // cSpell:disable-line
const M_ADDRESS = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(G_ADDRESS), Buffer.alloc(8, 1)])
);
const C_ADDRESS = "CAU3ADA6ILBLFOJMHZX5OTPFGWNI37IWF233CECFW5M2TUQZAO4DNCFQ"; // cSpell:disable-line
const W_ADDRESS = encodeMuxedContractAddress(C_ADDRESS, "1");

describe("encodeCctpHookForStellar", () => {
  it.each([G_ADDRESS, M_ADDRESS, C_ADDRESS])("encodes %s as length-prefixed ASCII", (recipient) => {
    const encoded = encodeCctpHookForStellar(recipient);

    expect(encoded.readUInt32BE(0)).toBe(Buffer.byteLength(recipient, "ascii"));
    expect(encoded.subarray(4).toString("ascii")).toBe(recipient);
  });

  it.each(["", "not-stellar", G_ADDRESS.toLowerCase(), W_ADDRESS])("rejects unsupported recipient %s", (recipient) =>
    expect(() => encodeCctpHookForStellar(recipient)).toThrow("Invalid Stellar recipient")
  );
});
