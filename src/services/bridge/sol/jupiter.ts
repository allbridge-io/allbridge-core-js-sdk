import { NATIVE_MINT } from "@solana/spl-token";
import { Connection, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { JupiterError, SdkError } from "../../../exceptions";
import { fetchAddressLookupTableAccountsFromTx } from "../../../utils/sol/utils";
import { JupiterParams } from "./index";

export class JupiterService {
  connection: Connection;
  jupiterUrl: string;
  apiKeyHeader?: string;
  maxAccounts?: number;

  constructor(solanaRpcUrl: string, jupiterParams: JupiterParams) {
    this.connection = new Connection(solanaRpcUrl);
    this.jupiterUrl = jupiterParams.jupiterUrl.replace(/\/$/, ""); // trim last "/" if exist
    this.apiKeyHeader = jupiterParams.jupiterApiKeyHeader;
    this.maxAccounts = jupiterParams.jupiterMaxAccounts;
  }

  async getJupiterSwapTx(
    userAddress: string,
    stableTokenAddress: string,
    amount: string,
    exactOut: boolean
  ): Promise<{ tx: VersionedTransaction; amountIn?: string }> {
    let quoteResponse: any;
    try {
      const swapMode = exactOut ? "ExactOut" : "ExactIn";
      let url = `${this.jupiterUrl}/quote?inputMint=${stableTokenAddress}&outputMint=${NATIVE_MINT.toString()}&amount=${amount}&swapMode=${swapMode}&slippageBps=100&onlyDirectRoutes=true`;

      if (this.maxAccounts) {
        url += `&maxAccounts=${this.maxAccounts}`;
      }
      quoteResponse = await axios.get(url, {
        headers: this.apiKeyHeader ? { "x-api-key": this.apiKeyHeader } : undefined,
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get route");
    }

    let inAmount;
    if (exactOut && quoteResponse?.data?.inAmount) {
      inAmount = quoteResponse.data.inAmount;
    } else if (exactOut) {
      throw new JupiterError("Cannot get inAmount");
    }

    let transactionResponse: any;
    try {
      transactionResponse = await axios.post(
        `${this.jupiterUrl}/swap`,
        {
          quoteResponse: quoteResponse.data,
          userPublicKey: userAddress,
          wrapAndUnwrapSol: true,
        },
        {
          headers: this.apiKeyHeader ? { "x-api-key": this.apiKeyHeader } : undefined,
        }
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
    const tx = VersionedTransaction.deserialize(swapTransactionBuf);

    return exactOut ? { tx, amountIn: inAmount } : { tx };
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

      if (sdkTx.message.header.numRequiredSignatures === 2 && transaction.signatures.length === 1) {
        const signature = sdkTx.signatures[0];
        if (!signature) {
          throw new SdkError("Signature is undefined");
        }
        transaction.signatures.push(signature);
      }
      return transaction;
    } catch (e) {
      if (e instanceof Error && e.message) {
        throw new JupiterError(`Some error occurred during creation final swap and bridge transaction. ${e.message}`);
      }
      throw new JupiterError("Some error occurred during creation final swap and bridge transaction");
    }
  }
}
