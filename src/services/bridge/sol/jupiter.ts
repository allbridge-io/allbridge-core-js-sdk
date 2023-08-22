import { Configuration, Def1SwapModeEnum, DefaultApi, V4QuoteGetSwapModeEnum } from "@jup-ag/api";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { JupiterError } from "../../../exceptions";

const LOOKUP_TABLE_ADDRESS = "ACm9ocwiEk7DA3BBubJCmN7SwvjdrgpiaHHSy7QHaHJi";

export class JupiterService {
  connection: Connection;
  jupiterQuoteApi: DefaultApi;

  constructor(solanaRpcUrl: string) {
    this.connection = new Connection(solanaRpcUrl);
    const config = new Configuration({ basePath: "https://quote-api.jup.ag" });
    this.jupiterQuoteApi = new DefaultApi(config);
  }

  async getJupiterSwapTx(
    userAddress: string,
    stableTokenAddress: string,
    amountOut: string
  ): Promise<{ tx: VersionedTransaction; amountIn: string }> {
    const { data } = await this.jupiterQuoteApi.v4QuoteGet({
      inputMint: stableTokenAddress,
      outputMint: NATIVE_MINT.toString(),
      amount: amountOut,
      swapMode: V4QuoteGetSwapModeEnum.ExactOut,
      slippageBps: 100,
      onlyDirectRoutes: true,
    });
    const routes = data;
    if (!routes) {
      throw new JupiterError("Cannot get routes");
    }
    const route = routes[0];
    const { swapTransaction } = await this.jupiterQuoteApi.v4SwapPost({
      body: {
        route: { ...route, swapMode: Def1SwapModeEnum[routes[0].swapMode] },
        userPublicKey: userAddress,
      },
    });

    if (!swapTransaction) {
      throw new JupiterError("Cannot get swap transaction");
    }
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    return { tx: VersionedTransaction.deserialize(swapTransactionBuf), amountIn: route.inAmount };
  }

  async amendJupiterWithSdkTx(
    transaction: VersionedTransaction,
    sdkTx: VersionedTransaction
  ): Promise<VersionedTransaction> {
    const addressLookupTableAccounts = await Promise.all(
      transaction.message.addressTableLookups.map(async (lookup) => {
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(
            await this.connection.getAccountInfo(lookup.accountKey).then((res) => {
              if (!res) {
                throw new Error("Cannot get AccountInfo");
              }
              return res.data;
            })
          ),
        });
      })
    );

    const allbridgeTableAccount = await this.connection
      .getAddressLookupTable(new PublicKey(LOOKUP_TABLE_ADDRESS))
      .then((res) => res.value);
    if (!allbridgeTableAccount) {
      throw new Error("Cannot find allbridgeLookupTableAccount");
    }
    addressLookupTableAccounts.push(allbridgeTableAccount);

    const message = TransactionMessage.decompile(transaction.message, {
      addressLookupTableAccounts: addressLookupTableAccounts,
    });

    const sdkMessage = TransactionMessage.decompile(sdkTx.message);
    sdkMessage.instructions.shift();
    message.instructions.push(...sdkMessage.instructions);
    transaction.message = message.compileToV0Message(addressLookupTableAccounts);
    return transaction;
  }
}
