import { AllbridgeCoreSdkOptions, NodeUrlsConfig } from "../index";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiQueryParams: {},
  coreApiHeaders: {},
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "C3jAxHRTZjM2Bs7EqPir4nvrT8zKtpcW7RvGR9R2qKtN",
};

export const testnetNodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.devnet.solana.com",
  tronRpcUrl: "https://nile.trongrid.io/jsonrpc",
};
