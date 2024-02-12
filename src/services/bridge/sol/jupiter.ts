import { NATIVE_MINT } from "@solana/spl-token";
import { Connection, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { JupiterError } from "../../../exceptions";
import { fetchAddressLookupTableAccountsFromTx } from "../../../utils/sol/utils";

export class JupiterService {
  connection: Connection;

  constructor(solanaRpcUrl: string) {
    this.connection = new Connection(solanaRpcUrl);
  }

  async getJupiterSwapTx(
    userAddress: string,
    stableTokenAddress: string,
    amount: string
  ): Promise<{ tx: VersionedTransaction }> {
    let quoteResponse: any;
    try {
      quoteResponse = await axios.get(`https://quote-api.jup.ag/v6/quote?inputMint=${stableTokenAddress}
&outputMint=${NATIVE_MINT.toString()}
&amount=${amount}
&slippageBps=100
&onlyDirectRoutes=true`);
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get route");
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
    return { tx: VersionedTransaction.deserialize(swapTransactionBuf) };
  }

  async amendJupiterWithSdkTx(
    transaction: VersionedTransaction,
    sdkTx: VersionedTransaction
  ): Promise<VersionedTransaction> {
    try {
      const addressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(transaction, this.connection);
      const sdkAddressLookupTableAccounts = await fetchAddressLookupTableAccountsFromTx(sdkTx, this.connection);

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
