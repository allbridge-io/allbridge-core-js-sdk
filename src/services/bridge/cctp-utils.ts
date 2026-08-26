import { StrKey } from "@stellar/stellar-sdk";
import { SdkError } from "../../exceptions";

export function encodeCctpHookForStellar(recipient: string): Buffer {
  if (!StrKey.isValidEd25519PublicKey(recipient) && !StrKey.isValidMed25519PublicKey(recipient)) {
    throw new SdkError("Invalid Stellar recipient");
  }
  const recipientBytes = Buffer.from(recipient, "ascii");
  const hookData = Buffer.alloc(4 + recipientBytes.length);
  hookData.writeUInt32BE(recipientBytes.length);
  recipientBytes.copy(hookData, 4);
  return hookData;
}
