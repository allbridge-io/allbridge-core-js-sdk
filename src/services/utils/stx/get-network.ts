import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { StacksNetwork } from "@stacks/network/src/network";

export function getStxNetwork(nodeUrl: string): StacksNetwork {
  const isTestnet = nodeUrl.includes("testnet");

  return isTestnet
    ? { ...STACKS_TESTNET, client: { baseUrl: nodeUrl } }
    : { ...STACKS_MAINNET, client: { baseUrl: nodeUrl } };
}
