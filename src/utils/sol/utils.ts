import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AddressLookupTableAccount, Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { SdkError } from "../../exceptions";

export async function fetchAddressLookupTableAccountsFromTx(
  transaction: VersionedTransaction,
  connection: Connection
): Promise<AddressLookupTableAccount[]> {
  return await Promise.all(
    transaction.message.addressTableLookups.map(async (lookup) => {
      return new AddressLookupTableAccount({
        key: lookup.accountKey,
        state: AddressLookupTableAccount.deserialize(
          await connection.getAccountInfo(lookup.accountKey).then((res) => {
            if (!res) {
              throw new SdkError("Cannot get AccountInfo");
            }
            return res.data;
          })
        ),
      });
    })
  );
}

/**
 * The token program (SPL Token or Token-2022) that owns the mint.
 * @internal
 */
export async function getTokenProgramId(connection: Connection, mint: PublicKey): Promise<PublicKey> {
  const mintAccount = await connection.getAccountInfo(mint);
  if (!mintAccount) {
    throw new SdkError(`Solana mint ${mint.toBase58()} not found`);
  }
  if (mintAccount.owner.equals(TOKEN_PROGRAM_ID) || mintAccount.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return mintAccount.owner;
  }
  throw new SdkError(`Solana mint ${mint.toBase58()} is not owned by a token program`);
}
