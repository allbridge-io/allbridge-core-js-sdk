import { Program, Provider, Spl } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
/* eslint-disable-next-line  import/no-named-as-default */
import Big from "big.js";
import { Web3 } from "web3";
import { InvalidTxError, SdkError } from "../../../exceptions";
import { PoolInfo } from "../../../tokens-info";
import { swapToVUsd } from "../../../utils/calculation";
import { TokenAccountData } from "../../models/sol";
import { Bridge as BridgeType } from "../../models/sol/types/bridge";

export async function getTokenAccountData(account: PublicKey, provider: Provider): Promise<TokenAccountData> {
  return await Spl.token(provider).account.token.fetch(account);
}

export async function getVUsdAmount(
  amount: string,
  bridge: Program<BridgeType>,
  poolAccount: PublicKey,
): Promise<string> {
  const poolAccountInfo = await bridge.account.pool.fetch(poolAccount);
  const decimals = poolAccountInfo.decimals;
  const feeShare = Big(poolAccountInfo.feeShareBp.toString()).div(10000).toFixed();
  const poolInfo: Omit<PoolInfo, "p" | "imbalance"> = {
    aValue: poolAccountInfo.a.toString(),
    dValue: poolAccountInfo.d.toString(),
    totalLpAmount: poolAccountInfo.totalLpAmount.toString(),
    tokenBalance: poolAccountInfo.tokenBalance.toString(),
    vUsdBalance: poolAccountInfo.vUsdBalance.toString(),
    accRewardPerShareP: poolAccountInfo.accRewardPerShareP.toString(),
  };
  return swapToVUsd(amount, { decimals, feeShare }, poolInfo);
}

export function getMessage(args: {
  amount: string;
  recipient: Buffer;
  sourceChainId: number;
  destinationChainId: number;
  receiveToken: Buffer;
  nonce: Buffer;
  chainBridge: Buffer;
}): Buffer {
  const amount = args.amount;
  const recipient = "0x" + args.recipient.toString("hex");
  const sourceChainId = args.sourceChainId;
  const destinationsChainId = args.destinationChainId;
  const receiveToken = "0x" + args.receiveToken.toString("hex");
  const nonce = "0x" + args.nonce.toString("hex");
  const messenger = 1;
  const chainBridge = "0x" + args.chainBridge.toString("hex");

  const message = Web3.utils.encodePacked(
    { t: "uint256", v: amount },
    { t: "bytes32", v: recipient },
    { t: "uint256", v: sourceChainId },
    { t: "bytes32", v: receiveToken },
    { t: "uint256", v: nonce },
    { t: "uint8", v: messenger },
  );

  if (!message) {
    throw new SdkError("message cannot be undefined");
  }
  const hash = Web3.utils.keccak256(Buffer.from(message.replace("0x", ""), "hex") as any);

  const hashBuffer = Buffer.from(hash.replace("0x", ""), "hex");
  hashBuffer[0] = sourceChainId;
  hashBuffer[1] = destinationsChainId;

  const messageWithSigner = Web3.utils.encodePacked(
    { t: "bytes32", v: "0x" + hashBuffer.toString("hex") },
    { t: "bytes32", v: chainBridge },
  );

  if (!messageWithSigner) {
    throw new InvalidTxError("messageWithSigner cannot be undefined");
  }

  const hashWithSigner = Web3.utils.keccak256(Buffer.from(messageWithSigner.replace("0x", ""), "hex") as any);

  const hashWithSignerBuffer = Buffer.from(hashWithSigner.replace("0x", ""), "hex");

  hashWithSignerBuffer[0] = hashBuffer[0];
  hashWithSignerBuffer[1] = hashBuffer[1];
  return hashWithSignerBuffer;
}
