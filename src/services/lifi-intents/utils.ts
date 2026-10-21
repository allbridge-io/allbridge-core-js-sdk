import { Big } from "big.js";
import { ChainType } from "../../chains/chain.enums";
import { InvalidGasFeePaymentOptionError, LifiIntentsDoesNotSupportedError, SdkError } from "../../exceptions";
import { FeePaymentMethod } from "../../models";
import { TokenWithChainDetails } from "../../tokens-info";
import { SendParams } from "../bridge/models";

/**
 * Thrown when a LI.FI Intents transfer reaches a bridge-contract code path.
 * @internal
 */
export function lifiIntentsNotABridgeContractError(): SdkError {
  return new SdkError(
    "LI.FI Intents transactions are built by the Core API: use rawTxBuilder.send or lifiIntents.buildSendTransaction"
  );
}

/**
 * Thrown by allowance and approve calls for a native source token with `Messenger.LIFI_INTENTS`.
 * @internal
 */
export function lifiIntentsNativeNoApprovalError(): SdkError {
  return new SdkError("A native token needs no approval for LI.FI Intents transfers");
}

/**
 * Whether the tokens form a {@link Messenger.LIFI_INTENTS} route: the source token is on an EVM chain,
 * has `lifiIntents.bridgeAddress` and lists the destination token in `lifiIntents.destinations`.
 */
export function isLifiIntentsRouteSupported(
  sourceToken: TokenWithChainDetails,
  destinationToken: TokenWithChainDetails
): boolean {
  if (sourceToken.chainType !== ChainType.EVM || sourceToken.chainSymbol === destinationToken.chainSymbol) {
    return false;
  }
  const lifiIntents = sourceToken.lifiIntents;
  if (!lifiIntents?.bridgeAddress) {
    return false;
  }
  const destinations = lifiIntents.destinations?.[destinationToken.chainSymbol] ?? [];
  const destinationTokenAddress = destinationToken.tokenAddress.toLowerCase();
  return destinations.some((tokenAddress) => tokenAddress.toLowerCase() === destinationTokenAddress);
}

/**
 * Throws {@link LifiIntentsDoesNotSupportedError} unless {@link isLifiIntentsRouteSupported}.
 * @internal
 */
export function assertLifiIntentsRoute(sourceToken: TokenWithChainDetails, destinationToken: TokenWithChainDetails) {
  if (!isLifiIntentsRouteSupported(sourceToken, destinationToken)) {
    throw new LifiIntentsDoesNotSupportedError("Such route does not support LI.FI Intents protocol");
  }
}

/**
 * LI.FI Intents transfers have no relayer fee and no extra gas: rejects a positive `fee` or `extraGas`
 * and paying with ABR (the zero fee can be "paid" with the native currency or the stablecoin, as `getGasFeeOptions` offers).
 * @internal
 */
export function assertLifiIntentsSendParams(params: SendParams) {
  if (params.gasFeePaymentMethod === FeePaymentMethod.WITH_ABR) {
    throw new InvalidGasFeePaymentOptionError("LI.FI Intents transfers cannot pay the fee with ABR");
  }
  if (params.extraGas && Big(params.extraGas).gt(0)) {
    throw new InvalidGasFeePaymentOptionError("LI.FI Intents transfers do not support extra gas");
  }
  if (params.fee && Big(params.fee).gt(0)) {
    throw new InvalidGasFeePaymentOptionError("LI.FI Intents transfers have no relayer fee: omit 'fee' or pass 0");
  }
}
