import { Messenger } from "../../client/core-api/core-api.model";
import { CCTPDoesNotSupportedError, OFTDoesNotSupportedError, SdkError } from "../../exceptions";
import { FeePaymentMethod } from "../../models";
import { TokenWithChainDetails } from "../../tokens-info";

export function resolveSpender(
  token: TokenWithChainDetails,
  messenger: Messenger,
  gasFeePaymentMethod: FeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY
): string {
  if (gasFeePaymentMethod === FeePaymentMethod.WITH_ABR) {
    if (token.abrPayer) {
      return token.abrPayer.payerAddress;
    }
    throw new SdkError("Token must contain 'abrPayer' for ABR payment method");
  }
  switch (messenger) {
    case Messenger.CCTP:
      if (token.cctpAddress) {
        return token.cctpAddress;
      } else {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
      }
    case Messenger.CCTP_V2:
      if (token.cctpV2Address) {
        return token.cctpV2Address;
      } else {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP V2 protocol");
      }
    case Messenger.OFT:
      if (token.oftBridgeAddress) {
        return token.oftBridgeAddress;
      } else {
        throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
      }
    case Messenger.X_RESERVE:
      if (token.xReserve?.bridgeAddress) {
        return token.xReserve.bridgeAddress;
      } else {
        throw new SdkError("Such route does not support xReserve protocol");
      }
    case Messenger.ALLBRIDGE:
    case Messenger.WORMHOLE:
      return token.bridgeAddress;
  }
}
