import { AllbridgeCoreSdkOptions, NodeRpcUrls, NodeUrlsConfig } from "../index";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "C3jAxHRTZjM2Bs7EqPir4nvrT8zKtpcW7RvGR9R2qKtN",
  sorobanNetworkPassphrase: "Test SDF Network ; September 2015",
  tronJsonRpc: "https://nile.trongrid.io/jsonrpc",
  cctpParams: {
    cctpTransmitterProgramId: "CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd",
    cctpTokenMessengerMinter: "CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3",
    cctpDomains: { SPL: 0 },
  },
};

/**
 * @Deprecated use {@link testnetNodeRpcUrlsDefault}
 */
export const testnetNodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.devnet.solana.com",
  tronRpcUrl: "https://nile.trongrid.io",
};

export const testnetNodeRpcUrlsDefault: NodeRpcUrls = {
  SOL: "https://api.devnet.solana.com",
  TRX: "https://nile.trongrid.io",
  SRB: "https://soroban-testnet.stellar.org",
  STLR: "https://horizon-testnet.stellar.org",
};
