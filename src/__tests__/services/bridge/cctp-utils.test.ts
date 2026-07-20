import { StrKey } from "@stellar/stellar-sdk";
import { encodeCctpHookForStellar } from "../../../services/bridge/cctp-utils";

const G_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"; // cSpell:disable-line
const M_ADDRESS = StrKey.encodeMed25519PublicKey(
  Buffer.concat([StrKey.decodeEd25519PublicKey(G_ADDRESS), Buffer.alloc(8, 1)])
);

describe("encodeCctpHookForStellar", () => {
  it.each([G_ADDRESS, M_ADDRESS])("encodes %s as length-prefixed ASCII", (recipient) => {
    const encoded = encodeCctpHookForStellar(recipient);

    expect(encoded.readUInt32BE(0)).toBe(Buffer.byteLength(recipient, "ascii"));
    expect(encoded.subarray(4).toString("ascii")).toBe(recipient);
  });

  /* cSpell:disable */
  it.each(["", "not-stellar", "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM"])(
    "rejects unsupported recipient %s",
    (recipient) => expect(() => encodeCctpHookForStellar(recipient)).toThrow("Invalid Stellar recipient")
  );
  /* cSpell:enable */
});
