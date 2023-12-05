import { AllbridgeCoreSdkOptions, NodeRpcUrls, NodeUrlsConfig } from "../index";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "C3jAxHRTZjM2Bs7EqPir4nvrT8zKtpcW7RvGR9R2qKtN",
  sorobanNetworkPassphrase: "Test SDF Future Network ; October 2022",
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
  SRB: "https://rpc-futurenet.stellar.org:443",
  STLR: "https://horizon-futurenet.stellar.org",
};
