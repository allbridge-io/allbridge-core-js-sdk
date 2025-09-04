import { YieldDoesNotSupportedError } from "../../exceptions";
import { TokenWithChainDetails } from "../../tokens-info";
import { TokenWithChainDetailsYield } from "./models";

/**
 * Assert that token is supported by Yield,</br>
 * asserts token is TokenWithChainDetailsYield</br>
 * throws {@link YieldDoesNotSupportedError} if not
 * @param token
 */
export function assertYieldIsSupported(token: TokenWithChainDetails): asserts token is TokenWithChainDetailsYield {
  if (!isYieldSupported(token)) {
    throw new YieldDoesNotSupportedError("Token does not support Yield");
  }
}

/**
 * is Yield support
 * @param token
 * @return isYieldSupported
 */
export function isYieldSupported(token: TokenWithChainDetails): token is TokenWithChainDetailsYield {
  return !!token.yieldAddress && token.yieldId !== undefined;
}
