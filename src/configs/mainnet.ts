import { AllbridgeCoreSdkOptions, NodeUrlsConfig } from "../index";

export const mainnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core.api.allbridgecoreapi.net",
  coreApiHeaders: {},
  wormholeMessengerProgramId: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
  solanaLookUpTable: "ACm9ocwiEk7DA3BBubJCmN7SwvjdrgpiaHHSy7QHaHJi",
};

/**
 *  This is default rpc urls,<p/> Override and use your own for proper and stable work
 */
export const nodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  tronRpcUrl: "https://api.trongrid.io/jsonrpc",
};
