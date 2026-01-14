import { SdkError } from "../../../exceptions";
import { TokenWithChainDetails } from "../../../tokens-info";

export function getTokenName(token: TokenWithChainDetails): string {
  if (!token.originTokenAddress) {
    throw new SdkError("STX token must contain 'originTokenAddress'");
  }
  const [_address, name] = token.originTokenAddress.split("::");
  if (!name) {
    throw new SdkError("STX token must contain 'originTokenAddress' ends with '::<tokenName>'");
  }
  return name;
}
