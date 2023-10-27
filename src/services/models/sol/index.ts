import { BN, Program, Provider } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Bridge as BridgeType } from "./types/bridge";
import { CctpBridge as CctpBridgeType } from "./types/cctp_bridge";

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
  extraGasInstruction?: TransactionInstruction;
  provider: Provider;
}

export interface SwapAndBridgeSolDataCctpData {
  cctpBridge: Program<CctpBridgeType>;
  cctpBridgeAccount: PublicKey;
  cctpAddressAccount: PublicKey;
  amount: BN;
  recipient: number[];
  receiveToken: number[];
  userToken: PublicKey;
  bridgeAuthority: PublicKey;
  bridgeTokenAccount: PublicKey;
  chainBridgeAccount: PublicKey;
  userAccount: PublicKey;
  destinationChainId: number;
  mint: PublicKey;
  gasPrice: PublicKey;
  thisGasPrice: PublicKey;
  extraGasInstruction?: TransactionInstruction;
  provider: Provider;
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
