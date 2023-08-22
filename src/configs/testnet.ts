import { AllbridgeCoreSdkOptions, NodeUrlsConfig } from "../index";

export const testnet: AllbridgeCoreSdkOptions = {
  coreApiUrl: "https://core-dev.a11bd.net",
  coreApiHeaders: {},
  wormholeMessengerProgramId: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  solanaLookUpTable: "ACm9ocwiEk7DA3BBubJCmN7SwvjdrgpiaHHSy7QHaHJi",
};

export const testnetNodeUrlsDefault: NodeUrlsConfig = {
  solanaRpcUrl: "https://api.devnet.solana.com",
  tronRpcUrl: "https://nile.trongrid.io/jsonrpc",
};
