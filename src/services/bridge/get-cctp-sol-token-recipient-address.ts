import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { ChainType } from "../../chains/chain.enums";
import { SdkError } from "../../exceptions";
import { getAssociatedAccount } from "../utils/sol/accounts";
import { buildAnchorProvider } from "../utils/sol/anchor-provider";
import { formatAddress } from "./utils";

// 1. OVERLOADS
export function getCctpSolTokenRecipientAddress(
  chainType: ChainType.EVM | ChainType.SUI,
  toAccountAddress: string,
  destinationTokenAddress: string,
  solRpcUrl: string
): Promise<string>;
export function getCctpSolTokenRecipientAddress(
  chainType: ChainType.TRX,
  toAccountAddress: string,
  destinationTokenAddress: string,
  solRpcUrl: string
): Promise<Buffer>;
export function getCctpSolTokenRecipientAddress(
  chainType: ChainType.SOLANA | ChainType.SRB,
  toAccountAddress: string,
  destinationTokenAddress: string,
  solRpcUrl: string
): Promise<number[]>;
export function getCctpSolTokenRecipientAddress(
  chainType: ChainType,
  toAccountAddress: string,
  destinationTokenAddress: string,
  solRpcUrl: string
): Promise<string | number[] | Buffer>;

// 2. COMMON Realization
export async function getCctpSolTokenRecipientAddress(
  chainType: ChainType,
  toAccountAddress: string,
  destinationTokenAddress: string,
  solRpcUrl: string
): Promise<string | number[] | Buffer> {
  let recipientWalletAddress: string | number[] | Buffer;
  const receiverAccount = new PublicKey(toAccountAddress);
  const receiveMint = new PublicKey(destinationTokenAddress);
  const receiveUserToken = await getAssociatedAccount(receiverAccount, receiveMint);
  const provider = buildAnchorProvider(solRpcUrl, toAccountAddress);
  anchor.setProvider(provider);
  const accountData = await anchor.Spl.token(provider).account.token.fetchNullable(receiveUserToken);
  if (accountData?.authority.equals(receiverAccount)) {
    recipientWalletAddress = await formatAddress(receiveUserToken.toBase58(), ChainType.SOLANA, chainType);
  } else {
    const tokenAccounts = await provider.connection.getTokenAccountsByOwner(receiverAccount, {
      mint: receiveMint,
    });
    if (tokenAccounts.value.length === 0 && !accountData) {
      recipientWalletAddress = await formatAddress(receiveUserToken.toBase58(), ChainType.SOLANA, chainType);
    } else if (tokenAccounts.value.length > 0) {
      const firstTokenAccount = tokenAccounts.value[0];

      if (!firstTokenAccount?.pubkey) {
        throw new SdkError("First token account or its public key is undefined");
      }
      recipientWalletAddress = await formatAddress(firstTokenAccount.pubkey.toBase58(), ChainType.SOLANA, chainType);
    } else {
      throw new SdkError("Associated account has wrong owner");
    }
  }
  return recipientWalletAddress;
}
