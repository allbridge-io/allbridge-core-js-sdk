import { BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Bridge as BridgeType } from "./types/bridge";

export interface SwapAndBridgeSolData {
  bridge: Program<BridgeType>;
  amount: BN;
  vusdAmount: BN;
  nonce: number[];
  recipient: number[];
  receiveToken: number[];
  poolAccount: PublicKey;
  lockAccount: PublicKey;
  bridgeAuthority: PublicKey;
  userToken: PublicKey;
  bridgeTokenAccount: PublicKey;
  chainBridgeAccount: PublicKey;
  otherBridgeTokenAccount: PublicKey;
  userAccount: PublicKey;
  destinationChainId: number;
  mint: string;
  config: PublicKey;
  configAccountInfo: ConfigAccountInfo;
  gasPrice: PublicKey;
  thisGasPrice: PublicKey;
  message: Buffer;
}

interface ConfigAccountInfo {
  allbridgeMessengerProgramId: PublicKey;
  wormholeMessengerProgramId: PublicKey;
  gasOracleProgramId: PublicKey;
}

export interface TokenAccountData {
  amount: BN;
  authority: PublicKey;
  closeAuthority: unknown;
  delegate: unknown;
  delegatedAmount: BN;
  isNative: unknown;
  mint: PublicKey;
  state: unknown;
}
