import { Big } from "big.js";
import { InvalidGasFeePaymentOptionError, NearIntentsDoesNotSupportedError, SdkError } from "../../exceptions";
import { TokenWithChainDetails } from "../../tokens-info";
import { SendParams } from "../bridge/models";

/**
 * Thrown by the chain bridge services that cannot build a NEAR Intents deposit transfer yet.
 * @internal
 */
export function nearIntentsChainNotSupportedError(chainSymbol: string): SdkError {
  return new SdkError(`NEAR Intents transfers from ${chainSymbol} are not supported yet`);
}

/**
 * Thrown when a NEAR Intents transfer reaches a bridge-contract code path.
 * @internal
 */
export function nearIntentsNotABridgeContractError(): SdkError {
  return new SdkError(
    "NEAR Intents transfers do not go through a bridge contract: use rawTxBuilder.send or nearIntents.buildSendTransaction"
  );
}

/**
 * Thrown by allowance and approve calls for `Messenger.NEAR_INTENTS`.
 * @internal
 */
export function nearIntentsNoApprovalError(): SdkError {
  return new SdkError("NEAR Intents transfers need no approval");
}

/**
 * Throws {@link NearIntentsDoesNotSupportedError} unless both tokens carry `nearIntents`.
 * @internal
 */
export function assertNearIntentsRoute(sourceToken: TokenWithChainDetails, destinationToken: TokenWithChainDetails) {
  if (!sourceToken.nearIntents || !destinationToken.nearIntents) {
    throw new NearIntentsDoesNotSupportedError("Such route does not support NEAR Intents protocol");
  }
}

/**
 * NEAR Intents transfers have no relayer fee and no extra gas: rejects a positive `fee` or `extraGas`.
 * @internal
 */
export function assertNearIntentsSendParams(params: SendParams) {
  if (params.extraGas && Big(params.extraGas).gt(0)) {
    throw new InvalidGasFeePaymentOptionError("NEAR Intents transfers do not support extra gas");
  }
  if (params.fee && Big(params.fee).gt(0)) {
    throw new InvalidGasFeePaymentOptionError("NEAR Intents transfers have no relayer fee: omit 'fee' or pass 0");
  }
}
