import { AllbridgeCoreSdkOptions, NodeRpcUrls, NodeUrlsConfig } from "../index";

export const mainnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core.api.allbridgecoreapi.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  jupiterUrl: "https://lite-api.jup.ag/swap/v1",
  wormholeMessengerProgramId: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
  solanaLookUpTable: "2JcBAEVnAwVo4u8d61iqgHPrzZuugur7cVTjWubsVLHj",
  sorobanNetworkPassphrase: "Public Global Stellar Network ; September 2015",
  tronJsonRpc: "https://api.trongrid.io/jsonrpc",
  cctpParams: {
    cctpTransmitterProgramId: "CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd",
    cctpTokenMessengerMinter: "CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3",
    cctpDomains: { ETH: 0, AVA: 1, OPT: 2, ARB: 3, SOL: 5, BAS: 6, POL: 7, SUI: 8 },
  },
  cachePoolInfoChainSec: 20,
};

/**
 *  This is default rpc urls for Solana and Tron,<p/> Override and use your own for proper and stable work
 *  @deprecated use {@link nodeRpcUrlsDefault}
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
  SRB: "https://rpc.stellar.org:443",
  STLR: "https://horizon.stellar.org",
  SUI: "https://fullnode.mainnet.sui.io",
};
