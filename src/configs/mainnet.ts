import { AllbridgeCoreSdkOptions, NodeRpcUrls, NodeUrlsConfig } from "../index";

export const mainnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core.api.allbridgecoreapi.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  wormholeMessengerProgramId: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
  solanaLookUpTable: "2JcBAEVnAwVo4u8d61iqgHPrzZuugur7cVTjWubsVLHj",
};

/**
 *  This is default rpc urls for Solana and Tron,<p/> Override and use your own for proper and stable work
 *  @Deprecated use {@link testnetNodeRpcUrlsDefault}
 */
export const nodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.mainnet-beta.solana.com",
  tronRpcUrl: "https://api.trongrid.io",
};

/**
 *  This is default rpc urls for Solana and Tron,<p/> Override and use your own for proper and stable work
 */
export const nodeRpcUrlsDefault: NodeRpcUrls = {
  SOL: "https://api.mainnet-beta.solana.com",
  TRX: "https://api.trongrid.io",
};
