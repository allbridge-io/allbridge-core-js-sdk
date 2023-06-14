import { AllbridgeCoreClientPoolInfoCaching } from "../client/core-api/core-client-pool-info-caching";
import { TokenWithChainDetails } from "../tokens-info";

export async function getPoolInfoByToken(
  api: AllbridgeCoreClientPoolInfoCaching,
  sourceChainToken: TokenWithChainDetails
) {
  return await api.getPoolInfoByKey({
    chainSymbol: sourceChainToken.chainSymbol,
    poolAddress: sourceChainToken.poolAddress,
  });
}
