import nock, { Body, RequestBodyMatcher } from "nock";
import { PoolInfo, TokenWithChainDetails } from "../../tokens-info";

export function getRequestBodyMatcher(expectedBody: any): RequestBodyMatcher {
  return (body: Body) => JSON.stringify(body) === JSON.stringify(expectedBody);
}

export function mockTokenInfoEndpoint(
  scope: nock.Scope,
  pools: { token: TokenWithChainDetails; poolInfo: PoolInfo }[]
) {
  let resultInfo = {};
  for (const pool of pools) {
    const infoResponse = {
      [pool.token.chainSymbol]: {
        tokens: [
          {
            name: pool.token.name,
            poolAddress: pool.token.poolAddress,
            tokenAddress: pool.token.tokenAddress,
            decimals: pool.token.decimals,
            symbol: pool.token.symbol,
            poolInfo: pool.poolInfo,
            feeShare: pool.token.feeShare,
            apr: pool.token.apr,
            lpRate: pool.token.lpRate,
          },
        ],
        chainId: pool.token.chainId,
        bridgeAddress: pool.token.bridgeAddress,
        transferTime: pool.token.transferTime,
        confirmations: pool.token.confirmations,
        txCostAmount: pool.token.txCostAmount,
      },
    };
    resultInfo = {
      ...resultInfo,
      ...infoResponse,
    };
  }
  scope.get("/token-info").reply(200, resultInfo).persist();
}

export function rpcReply(result: any): (url: string, body: any) => Record<string, any> {
  return (url, body: any) => ({
    jsonrpc: "2.0",
    id: body.id,
    result: result,
  });
}
