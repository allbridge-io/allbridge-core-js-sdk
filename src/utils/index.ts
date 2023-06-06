import { AllbridgeCachingCoreClient } from "../client/core-api/caching-core-client";
import { TokenWithChainDetails } from "../tokens-info";

export async function getPoolInfoByToken(api: AllbridgeCachingCoreClient, sourceChainToken: TokenWithChainDetails) {
  return await api.getPoolInfoByKey({
    chainSymbol: sourceChainToken.chainSymbol,
    poolAddress: sourceChainToken.poolAddress,
  });
}
