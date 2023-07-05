import { AllbridgeCoreSdk, ChainSymbol } from "@allbridge/bridge-core-sdk";
import { getEnvVar } from "../../utils/env";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const main = async () => {
  const txId = getEnvVar("SENT_TX_ID");
  const chainSymbol = ChainSymbol.TRX; // example, must correspond to SENT_TX_ID blockchain

  const sdk = new AllbridgeCoreSdk();

  const sendStatus = await sdk.getTransferStatus(chainSymbol, txId);

  console.log("Send Status: ", sendStatus);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
