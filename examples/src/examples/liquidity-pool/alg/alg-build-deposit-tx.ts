import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, RawAlgTransaction } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";
import { testnet, testnetNodeRpcUrlsDefault } from "../../testnet";
import { sendAlgRawTransaction } from "../../../utils/alg";

dotenv.config({ path: ".env" });

const main = async () => {
  // sender address
  const accountAddress = getEnvVar("ALG_ACCOUNT_ADDRESS");
  const tokenAddress = getEnvVar("ALG_TOKEN_ADDRESS");

  // const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ALG: getEnvVar("ALG_PROVIDER_URL") });//TODO
  const sdk = new AllbridgeCoreSdk({ ...testnetNodeRpcUrlsDefault }, testnet);
  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.tokenAddress === tokenAddress));

  const oneToken = "1.1";
  // create deposit raw transaction
  const rawTransactionDeposit = (await sdk.pool.rawTxBuilder.deposit({
    amount: oneToken,
    accountAddress: accountAddress,
    token: tokenInfo,
  })) as RawAlgTransaction;

  const isOptedIn = await sdk.utils.alg.checkAppOptIn(tokenInfo.poolAddress, accountAddress);
  let optInRawTx: RawAlgTransaction | undefined;
  if (!isOptedIn) {
    console.log("One-time optIn to poolApp required");
    optInRawTx = await sdk.utils.alg.buildRawTransactionAppOptIn(tokenInfo.poolAddress, accountAddress);
  }

  const txs = optInRawTx ? [...optInRawTx, ...rawTransactionDeposit] : rawTransactionDeposit;
  const txId = await sendAlgRawTransaction(txs);
  console.log("Token deposit:", txId);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
