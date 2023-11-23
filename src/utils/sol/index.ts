import { AddressLookupTableAccount, Connection, VersionedTransaction } from "@solana/web3.js";

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
              throw new Error("Cannot get AccountInfo");
            }
            return res.data;
          })
        ),
      });
    })
  );
}
