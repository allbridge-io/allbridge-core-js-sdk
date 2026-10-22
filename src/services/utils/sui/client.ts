import type { SuiClientTypes } from "@mysten/sui/client";
import { SuiGrpcClient } from "@mysten/sui/grpc";

export type SuiCoin = SuiClientTypes.Coin;

/**
 * Sui full nodes stopped serving JSON-RPC on 2026-10-22, so the SUI node URL is the gRPC-web (`sui.rpc.v2`)
 * base URL of a full node, e.g. `https://fullnode.mainnet.sui.io`.
 */
export function createSuiClient(nodeUrl: string, isTestnet?: boolean): SuiGrpcClient {
  return new SuiGrpcClient({
    network: isTestnet ? "testnet" : "mainnet",
    baseUrl: nodeUrl.replace(/\/+$/, ""),
  });
}
