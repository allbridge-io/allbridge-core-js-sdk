import { StrKey } from "@stellar/stellar-sdk";
import { SdkError } from "../../../exceptions";

export function decodeStellarContractId(contract: string): Buffer {
  if (!StrKey.isValidContract(contract)) {
    throw new SdkError("Invalid Stellar contract");
  }
  return Buffer.from(StrKey.decodeContract(contract));
}
