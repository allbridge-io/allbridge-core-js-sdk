import { AllbridgeCoreSdkOptions, NodeUrlsConfig } from "../index";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiHeaders: {},
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "DPksfBY4KqcBwgxC7fUXPHEqg939z2gGpzVCoEBn4PXE",
};

export const testnetNodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.devnet.solana.com",
  tronRpcUrl: "https://nile.trongrid.io/jsonrpc",
};
