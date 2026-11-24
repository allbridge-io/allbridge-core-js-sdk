import { StrKey } from "@stellar/stellar-sdk";
import { SdkError } from "../../exceptions";

/**
 * Whether the Stellar CCTP V2 bridge can deliver to this recipient: an account (`G…`), a muxed account (`M…`)
 * or a contract (`C…`), the address formats its `MuxedAddress::from_string_bytes` parses. A muxed contract (`W…`) is not
 * among them: the receive would fail on Stellar after the tokens are burned on the source chain.
 */
export function isValidCctpStellarRecipient(recipient: string): boolean {
  return (
    StrKey.isValidEd25519PublicKey(recipient) ||
    StrKey.isValidMed25519PublicKey(recipient) ||
    StrKey.isValidContract(recipient)
  );
}

export function encodeCctpHookForStellar(recipient: string): Buffer {
  if (!isValidCctpStellarRecipient(recipient)) {
    throw new SdkError("Invalid Stellar recipient");
  }
  const recipientBytes = Buffer.from(recipient, "ascii");
  const hookData = Buffer.alloc(4 + recipientBytes.length);
  hookData.writeUInt32BE(recipientBytes.length);
  recipientBytes.copy(hookData, 4);
  return hookData;
}
