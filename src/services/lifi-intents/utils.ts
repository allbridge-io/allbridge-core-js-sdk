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
 * Thrown by allowance and approve calls for a Solana source token with `Messenger.LIFI_INTENTS`.
 * @internal
 */
export function lifiIntentsSolanaNoApprovalError(): SdkError {
  return new SdkError("LI.FI Intents transfers from Solana need no approval");
}

/**
 * Thrown by the deprecated `bridge.send` for a LI.FI Intents transfer from a chain whose bridge service
 * cannot sign and send a transaction itself (SOL).
 * @internal
 */
export function lifiIntentsSendNotSupportedError(chainSymbol: string): SdkError {
  return new SdkError(
    `bridge.send cannot send LI.FI Intents transfers from ${chainSymbol}: use bridge.rawTxBuilder.send and sign the transaction`
  );
}

/**
 * Source chain types LI.FI Intents transfers can start from.
 * @internal
 */
const LIFI_INTENTS_SOURCE_CHAIN_TYPES: readonly ChainType[] = [ChainType.EVM, ChainType.SOLANA];

/**
 * Whether the tokens form a {@link Messenger.LIFI_INTENTS} route: the source token is on an EVM or Solana chain,
 * has `lifiIntents.bridgeAddress` and lists the destination token in `lifiIntents.destinations`.
 */
export function isLifiIntentsRouteSupported(
  sourceToken: TokenWithChainDetails,
  destinationToken: TokenWithChainDetails
): boolean {
  if (
    !LIFI_INTENTS_SOURCE_CHAIN_TYPES.includes(sourceToken.chainType) ||
    sourceToken.chainSymbol === destinationToken.chainSymbol
  ) {
    return false;
  }
  const lifiIntents = sourceToken.lifiIntents;
  if (!lifiIntents?.bridgeAddress) {
    return false;
  }
  const destinations = lifiIntents.destinations?.[destinationToken.chainSymbol] ?? [];
  // EVM addresses are case-insensitive, base58 (Solana) addresses are not
  const normalize = (address: string) =>
    destinationToken.chainType === ChainType.EVM ? address.toLowerCase() : address;
  const destinationTokenAddress = normalize(destinationToken.tokenAddress);
  return destinations.some((tokenAddress) => normalize(tokenAddress) === destinationTokenAddress);
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
