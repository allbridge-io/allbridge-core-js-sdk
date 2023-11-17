import { NATIVE_MINT } from "@solana/spl-token";
import { AddressLookupTableAccount, Connection, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { JupiterError, SdkError } from "../../../exceptions";

export class JupiterService {
  connection: Connection;

  constructor(solanaRpcUrl: string) {
    this.connection = new Connection(solanaRpcUrl);
  }

  async getJupiterSwapTx(
    userAddress: string,
    stableTokenAddress: string,
    amountOut: string
  ): Promise<{ tx: VersionedTransaction; amountIn: string }> {
    let quoteResponse: any;
    try {
      quoteResponse = await axios.get(`https://quote-api.jup.ag/v6/quote?inputMint=${stableTokenAddress}
&outputMint=${NATIVE_MINT.toString()}
&amount=${amountOut}
&swapMode=ExactOut
&slippageBps=100
&onlyDirectRoutes=true`);
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get route");
    }

    let inAmount;
    if (quoteResponse?.data?.inAmount) {
      inAmount = quoteResponse.data.inAmount;
    } else {
      throw new JupiterError("Cannot get inAmount");
    }

    let transactionResponse: any;
    try {
      transactionResponse = await axios.post(
        "https://quote-api.jup.ag/v6/swap",
        JSON.stringify({
          quoteResponse: quoteResponse.data,
          userPublicKey: userAddress,
          wrapAndUnwrapSol: true,
        })
      );
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get swap transaction");
    }

    let swapTransaction;
    if (transactionResponse?.data?.swapTransaction) {
      swapTransaction = transactionResponse.data.swapTransaction;
    } else {
      throw new JupiterError("Cannot get swap transaction");
    }

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    return { tx: VersionedTransaction.deserialize(swapTransactionBuf), amountIn: inAmount };
  }

  async amendJupiterWithSdkTx(
    transaction: VersionedTransaction,
    sdkTx: VersionedTransaction
  ): Promise<VersionedTransaction> {
    try {
      const addressLookupTableAccounts = await Promise.all(
        transaction.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(
              await this.connection.getAccountInfo(lookup.accountKey).then((res) => {
                if (!res) {
                  throw new SdkError("Cannot get AccountInfo");
                }
                return res.data;
              })
            ),
          });
        })
      );
      const sdkAddressLookupTableAccounts = await Promise.all(
        sdkTx.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(
              await this.connection.getAccountInfo(lookup.accountKey).then((res) => {
                if (!res) {
                  throw new SdkError("Cannot get AccountInfo");
                }
                return res.data;
              })
            ),
          });
        })
      );

      const message = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: addressLookupTableAccounts,
      });
      const sdkMessage = TransactionMessage.decompile(sdkTx.message, {
        addressLookupTableAccounts: sdkAddressLookupTableAccounts,
      });
      sdkMessage.instructions.shift();
      message.instructions.push(...sdkMessage.instructions);

      addressLookupTableAccounts.push(...sdkAddressLookupTableAccounts);

      transaction.message = message.compileToV0Message(addressLookupTableAccounts);
      return transaction;
    } catch (e) {
      if (e instanceof Error && e.message) {
        throw new JupiterError(`Some error occurred during creation final swap and bridge transaction. ${e.message}`);
      }
      throw new JupiterError("Some error occurred during creation final swap and bridge transaction");
    }
  }
}
